import type { AppCategory, AppManifest } from '@contracts/app';

/**
 * AppRegistry
 * Central registry for all FlowOS guest applications.
 * Applications register their manifest here to declare their metadata,
 * window constraints, permissions, and root component.
 */
class AppRegistryService {
  private readonly registry = new Map<string, AppManifest>();

  /**
   * Registers a new application manifest.
   * Throws an error if an application with the same ID is already registered.
   */
  public register(manifest: AppManifest): void {
    if (this.registry.has(manifest.id)) {
      console.warn(
        `[AppRegistry] Warning: Overwriting previously registered application: ${manifest.id}`
      );
    }
    this.registry.set(manifest.id, manifest);
  }

  /**
   * Retrieves an application manifest by ID.
   */
  public get(appId: string): AppManifest | undefined {
    return this.registry.get(appId);
  }

  /**
   * Returns true if an application with the given ID is registered.
   */
  public has(appId: string): boolean {
    return this.registry.has(appId);
  }

  /**
   * Returns a list of all registered application manifests.
   */
  public getAll(): AppManifest[] {
    return Array.from(this.registry.values());
  }

  /**
   * Returns all application manifests belonging to a specific category.
   */
  public getByCategory(category: AppCategory): AppManifest[] {
    return this.getAll().filter((app) => app.category === category);
  }
}

export const appRegistry = new AppRegistryService();
