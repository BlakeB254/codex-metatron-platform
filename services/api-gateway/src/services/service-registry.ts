import Redis from 'redis';

interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  metadata?: Record<string, any>;
}

class ServiceRegistry {
  private redis: any;
  private services: Map<string, ServiceInstance[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.redis = Redis.createClient({
          url: process.env.REDIS_URL,
        });
        
        await this.redis.connect();
        console.log('✅ Connected to Redis for service registry');
      } else {
        console.log('⚠️  Redis not configured, using in-memory service registry');
      }
      
      this.startHealthChecks();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      console.log('📝 Falling back to in-memory service registry');
    }
  }

  async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async registerService(service: Omit<ServiceInstance, 'lastHealthCheck'>): Promise<void> {
    const serviceWithTimestamp: ServiceInstance = {
      ...service,
      lastHealthCheck: new Date(),
    };

    if (this.redis) {
      try {
        await this.redis.hSet(
          `services:${service.name}`,
          service.id,
          JSON.stringify(serviceWithTimestamp)
        );
      } catch (error) {
        console.error('Failed to register service in Redis:', error);
      }
    }

    // Also store in memory
    if (!this.services.has(service.name)) {
      this.services.set(service.name, []);
    }
    
    const instances = this.services.get(service.name)!;
    const existingIndex = instances.findIndex(s => s.id === service.id);
    
    if (existingIndex >= 0) {
      instances[existingIndex] = serviceWithTimestamp;
    } else {
      instances.push(serviceWithTimestamp);
    }
  }

  async unregisterService(serviceName: string, instanceId: string): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.hDel(`services:${serviceName}`, instanceId);
      } catch (error) {
        console.error('Failed to unregister service from Redis:', error);
      }
    }

    // Also remove from memory
    const instances = this.services.get(serviceName);
    if (instances) {
      const filtered = instances.filter(s => s.id !== instanceId);
      this.services.set(serviceName, filtered);
    }
  }

  async getServices(serviceName: string): Promise<ServiceInstance[]> {
    let services: ServiceInstance[] = [];

    if (this.redis) {
      try {
        const serviceData = await this.redis.hGetAll(`services:${serviceName}`);
        services = Object.values(serviceData).map((data: string) => JSON.parse(data));
      } catch (error) {
        console.error('Failed to get services from Redis:', error);
      }
    }

    // Fallback to memory
    if (services.length === 0) {
      services = this.services.get(serviceName) || [];
    }

    // Filter healthy services
    return services.filter(service => service.health === 'healthy');
  }

  async getHealthyService(serviceName: string): Promise<ServiceInstance | null> {
    const services = await this.getServices(serviceName);
    
    if (services.length === 0) {
      return null;
    }

    // Simple round-robin for now
    // In production, you might want more sophisticated load balancing
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex];
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, instances] of this.services.entries()) {
      for (const instance of instances) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${instance.url}/health`, {
            method: 'GET',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          const isHealthy = response.ok;
          instance.health = isHealthy ? 'healthy' : 'unhealthy';
          instance.lastHealthCheck = new Date();

          // Update in Redis if available
          if (this.redis) {
            try {
              await this.redis.hSet(
                `services:${serviceName}`,
                instance.id,
                JSON.stringify(instance)
              );
            } catch (error) {
              console.error('Failed to update service health in Redis:', error);
            }
          }

        } catch (error) {
          console.error(`Health check failed for ${serviceName}:${instance.id}:`, error);
          instance.health = 'unhealthy';
          instance.lastHealthCheck = new Date();
        }
      }
    }
  }

  async getAllServices(): Promise<Record<string, ServiceInstance[]>> {
    const result: Record<string, ServiceInstance[]> = {};

    if (this.redis) {
      try {
        const keys = await this.redis.keys('services:*');
        for (const key of keys) {
          const serviceName = key.replace('services:', '');
          const serviceData = await this.redis.hGetAll(key);
          result[serviceName] = Object.values(serviceData).map((data: string) => JSON.parse(data));
        }
      } catch (error) {
        console.error('Failed to get all services from Redis:', error);
      }
    }

    // Merge with memory
    for (const [serviceName, instances] of this.services.entries()) {
      if (!result[serviceName]) {
        result[serviceName] = instances;
      }
    }

    return result;
  }

  async getHealthStatus(): Promise<Record<string, any>> {
    const allServices = await this.getAllServices();
    const healthStatus: Record<string, any> = {};

    for (const [serviceName, instances] of Object.entries(allServices)) {
      const healthyInstances = instances.filter(i => i.health === 'healthy');
      const totalInstances = instances.length;

      healthStatus[serviceName] = {
        status: healthyInstances.length > 0 ? 'healthy' : 'unhealthy',
        healthyInstances: healthyInstances.length,
        totalInstances,
        instances: instances.map(i => ({
          id: i.id,
          url: i.url,
          health: i.health,
          lastHealthCheck: i.lastHealthCheck,
        })),
      };
    }

    return healthStatus;
  }
}

export const serviceRegistry = new ServiceRegistry();