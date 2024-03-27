import * as path from 'node:path';

async function findDependencyPath(currentModulePath: string, dependency: string): Promise<string> {
  try {
    const resolvedPath = require.resolve(dependency, { paths: [currentModulePath] });
    const dependencyPath = path.dirname(resolvedPath);
    return dependencyPath;
  } catch (error) {
    throw new Error(`Could not find dependency "${dependency}" from "${currentModulePath}". Error: ${(error as Error).message}`);
  }
}

async function resolveDependenciesRecursively(currentDir: string, dependencies: string[]): Promise<string> {
  if (dependencies.length === 0) {
    return currentDir;
  }

  const [firstDependency, ...restDependencies] = dependencies;
  const dependencyPath = await findDependencyPath(currentDir, firstDependency);
  return resolveDependenciesRecursively(dependencyPath, restDependencies);
}

export async function trace() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: dtrace <dep1> <dep2> ...');
    process.exit(1);
  }

  try {
    const finalDependencyPath = await resolveDependenciesRecursively(process.cwd(), args);
    console.log(`Final dependency path: ${finalDependencyPath}`);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}