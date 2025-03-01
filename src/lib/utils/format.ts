/**
 * Utility functions for formatting values consistently across the application
 */

/**
 * Formats a points value in crores (1 crore = 10 million)
 * @param points The points value to format
 * @returns Formatted string with "Cr" suffix
 */
export function formatPointsInCrores(points: number | null | undefined): string {
    // Handle null/undefined
    if (points === null || points === undefined) {
        return "0 Cr";
    }
    
    // Ensure we're working with a number
    const numPoints = Number(points);
    
    // Handle NaN
    if (isNaN(numPoints)) {
        return "0 Cr";
    }
    
    // Convert to crores (1 crore = 10 million)
    const crores = numPoints / 10000000;
    
    // Format the value
    // For whole numbers, display without decimal places
    // For decimal values, display with up to 2 decimal places
    const formattedCrores = Number.isInteger(crores) 
        ? crores.toString() 
        : crores.toFixed(2).replace(/\.00$/, '');
    
    // Ensure there's a space between the number and "Cr"
    return `${formattedCrores} Cr`;
} 