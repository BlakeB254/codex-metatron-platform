import { serviceRegistry } from './service-registry';

interface LoadBalancingStrategy {
  selectInstance(instances: any[]): any | null;
}

class RoundRobinStrategy implements LoadBalancingStrategy {
  private counters: Map<string, number> = new Map();

  selectInstance(instances: any[]): any | null {
    if (instances.length === 0) return null;
    if (instances.length === 1) return instances[0];

    const serviceName = instances[0].name;
    const currentCounter = this.counters.get(serviceName) || 0;
    const selectedIndex = currentCounter % instances.length;
    
    this.counters.set(serviceName, currentCounter + 1);
    return instances[selectedIndex];
  }
}

class RandomStrategy implements LoadBalancingStrategy {
  selectInstance(instances: any[]): any | null {
    if (instances.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }
}

class LeastConnectionsStrategy implements LoadBalancingStrategy {
  private connections: Map<string, number> = new Map();

  selectInstance(instances: any[]): any | null {
    if (instances.length === 0) return null;
    if (instances.length === 1) return instances[0];

    // Find instance with least connections
    let selectedInstance = instances[0];
    let minConnections = this.connections.get(selectedInstance.id) || 0;

    for (const instance of instances) {
      const connections = this.connections.get(instance.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }

    return selectedInstance;
  }

  incrementConnections(instanceId: string): void {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, current + 1);
  }

  decrementConnections(instanceId: string): void {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, Math.max(0, current - 1));
  }
}

class LoadBalancer {
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private defaultStrategy: LoadBalancingStrategy;

  constructor() {
    this.defaultStrategy = new RoundRobinStrategy();
    this.strategies.set('round-robin', new RoundRobinStrategy());
    this.strategies.set('random', new RandomStrategy());
    this.strategies.set('least-connections', new LeastConnectionsStrategy());
  }

  async getServiceInstance(
    serviceName: string, 
    strategy: string = 'round-robin'
  ): Promise<any | null> {
    try {
      const instances = await serviceRegistry.getServices(serviceName);
      if (instances.length === 0) {
        console.warn(`No healthy instances found for service: ${serviceName}`);
        return null;
      }

      const loadBalancingStrategy = this.strategies.get(strategy) || this.defaultStrategy;
      const selectedInstance = loadBalancingStrategy.selectInstance(instances);

      if (selectedInstance) {
        console.log(`Selected instance ${selectedInstance.id} for service ${serviceName} using ${strategy} strategy`);
      }

      return selectedInstance;
    } catch (error) {
      console.error(`Error getting service instance for ${serviceName}:`, error);
      return null;
    }
  }

  async getServiceUrl(serviceName: string, strategy: string = 'round-robin'): Promise<string | null> {
    const instance = await this.getServiceInstance(serviceName, strategy);
    return instance ? instance.url : null;
  }

  setStrategy(serviceName: string, strategy: LoadBalancingStrategy): void {
    this.strategies.set(serviceName, strategy);
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  async getLoadBalancingStats(): Promise<Record<string, any>> {
    const allServices = await serviceRegistry.getAllServices();
    const stats: Record<string, any> = {};

    for (const [serviceName, instances] of Object.entries(allServices)) {
      const healthyInstances = instances.filter(i => i.health === 'healthy');
      
      stats[serviceName] = {
        totalInstances: instances.length,
        healthyInstances: healthyInstances.length,
        instanceDistribution: instances.map(i => ({
          id: i.id,
          url: i.url,
          health: i.health,
          lastSelected: 'N/A', // This would need tracking implementation
        })),
      };
    }

    return stats;
  }

  // Circuit breaker functionality
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  async getServiceInstanceWithCircuitBreaker(
    serviceName: string,
    strategy: string = 'round-robin'
  ): Promise<any | null> {
    let circuitBreaker = this.circuitBreakers.get(serviceName);
    
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker(serviceName);
      this.circuitBreakers.set(serviceName, circuitBreaker);
    }

    if (circuitBreaker.isOpen()) {
      console.warn(`Circuit breaker is open for service: ${serviceName}`);
      return null;
    }

    try {
      const instance = await this.getServiceInstance(serviceName, strategy);
      if (instance) {
        circuitBreaker.recordSuccess();
      }
      return instance;
    } catch (error) {
      circuitBreaker.recordFailure();
      throw error;
    }
  }
}

class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private serviceName: string,
    private failureThreshold: number = 5,
    private timeoutMs: number = 60000 // 1 minute
  ) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = 'half-open';
        console.log(`Circuit breaker for ${this.serviceName} is now half-open`);
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      console.warn(`Circuit breaker opened for ${this.serviceName} after ${this.failureCount} failures`);
    }
  }

  getState(): string {
    return this.state;
  }
}

export const loadBalancer = new LoadBalancer();
export { LoadBalancer, CircuitBreaker };