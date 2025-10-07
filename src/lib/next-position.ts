import { Widget } from "@/interface";

// Helper function to find next available position
export const findNextPosition = (
  widgets: Widget[],
  targetWidth: number,
  targetHeight: number,
  gridCols = 12,
): { x: number; y: number } => {
  if (widgets.length === 0) {
    return { x: 0, y: 0 };
  }

  // Create a grid to track occupied spaces
  const maxY =
    Math.max(...widgets.map((w) => w.position.y + w.position.h)) + targetHeight;
  const grid: boolean[][] = Array(maxY)
    .fill(null)
    .map(() => Array(gridCols).fill(false));

  // Mark occupied positions
  widgets.forEach((widget) => {
    for (
      let y = widget.position.y;
      y < widget.position.y + widget.position.h;
      y++
    ) {
      for (
        let x = widget.position.x;
        x < widget.position.x + widget.position.w && x < gridCols;
        x++
      ) {
        if (grid[y]) grid[y][x] = true;
      }
    }
  });

  // Find first available position
  for (let y = 0; y <= maxY - targetHeight; y++) {
    for (let x = 0; x <= gridCols - targetWidth; x++) {
      let canPlace = true;

      // Check if the target area is free
      for (let dy = 0; dy < targetHeight && canPlace; dy++) {
        for (let dx = 0; dx < targetWidth && canPlace; dx++) {
          if (grid[y + dy] && grid[y + dy][x + dx]) {
            canPlace = false;
          }
        }
      }

      if (canPlace) {
        return { x, y };
      }
    }
  }

  // If no space found, place at the bottom
  return { x: 0, y: maxY };
};