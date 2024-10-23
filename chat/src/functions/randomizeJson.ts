export function randomizeJsonValues(data: any): any {
    // Iterate through each key-value pair in the object
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        // If the value is an object, call the function recursively
        randomizeJsonValues(data[key]);
      } else if (typeof data[key] === 'number') {
        // If the value is a number, set it to a random number between 0 and 100
        data[key] = Math.floor(Math.random() * 101);
      }
    }
    return data;
  }