/**
 * Example function to demonstrate debugging with breakpoints
 * This function can be called from any component to test debugging
 */
export function debugExample(name: string, value: number): string {
  // Set a breakpoint on the next line to see the function parameters
  console.log(`Debug example called with name: ${name}, value: ${value}`);

  // Set a breakpoint here to inspect the calculation
  const result = value * 2 + name.length;

  // Set a breakpoint here to see the final result
  const message = `Hello ${name}, your calculated value is: ${result}`;

  return message;
}

/**
 * Async function example for debugging async operations
 */
export async function debugAsyncExample(): Promise<string> {
  // Set a breakpoint here to see the start of the async operation
  console.log("Starting async debug example");

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Set a breakpoint here to see the result after the delay
  const result = "Async operation completed!";

  return result;
}

/**
 * Function that demonstrates debugging with conditional breakpoints
 */
export function debugConditionalExample(items: string[]): string[] {
  const filteredItems: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // You can set a conditional breakpoint here: item.length > 5
    if (item.length > 5) {
      filteredItems.push(item.toUpperCase());
    } else {
      filteredItems.push(item.toLowerCase());
    }
  }

  return filteredItems;
}
