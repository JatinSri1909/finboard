import { WidgetField } from '@/types';

export class DataMapper {
  /**
   * Extract nested value from object using dot notation path
   */
  static getValueByPath(obj: any, path: string): any {
    if (!path || !obj) return undefined;
    
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      
      // Handle array indices like "data[0].price"
      if (key.includes('[') && key.includes(']')) {
        const arrayKey = key.substring(0, key.indexOf('['));
        const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
        return current[arrayKey]?.[index];
      }
      
      return current[key];
    }, obj);
  }

  /**
   * Extract all possible fields from API response data
   */
  static extractFields(data: any, prefix = ''): WidgetField[] {
    const fields: WidgetField[] = [];
    console.log('Extracting fields from data:', data);

    const extract = (obj: any, currentPath: string) => {
      if (obj === null || obj === undefined) return;

      if (Array.isArray(obj)) {
        fields.push({
          path: currentPath,
          label: this.formatFieldLabel(currentPath),
          type: 'array',
          sampleValue: obj.slice(0, 3),
          isSelected: false,
        });
        
        // Extract fields from first array item if it's an object
        if (obj.length > 0 && typeof obj[0] === 'object') {
          extract(obj[0], `${currentPath}[0]`);
        }
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          extract(obj[key], newPath);
        });
      } else {
        fields.push({
          path: currentPath,
          label: this.formatFieldLabel(currentPath),
          type: typeof obj as 'string' | 'number' | 'boolean',
          sampleValue: obj,
          isSelected: false,
        });
      }
    };

    extract(data, prefix);
    console.log('Extracted fields:', fields);
    return fields.sort((a, b) => a.path.localeCompare(b.path));
  }

  /**
   * Format field path into a readable label
   */
  static formatFieldLabel(path: string): string {
    return path
      .split('.')
      .map(part => {
        // Handle array indices
        if (part.includes('[')) {
          part = part.substring(0, part.indexOf('['));
        }
        // Convert camelCase to Title Case
        return part
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      })
      .join(' → ');
  }

  /**
   * Filter fields based on search query
   */
  static filterFields(fields: WidgetField[], query: string): WidgetField[] {
    if (!query.trim()) return fields;
    
    const lowercaseQuery = query.toLowerCase();
    return fields.filter(field => 
      field.path.toLowerCase().includes(lowercaseQuery) ||
      field.label.toLowerCase().includes(lowercaseQuery) ||
      field.type.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get selected field values from data
   */
  static getSelectedFieldValues(data: any, selectedFields: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    selectedFields.forEach(fieldPath => {
      result[fieldPath] = this.getValueByPath(data, fieldPath);
    });
    
    return result;
  }

  /**
   * Format value based on type and format
   */
  static formatValue(value: any, type: string, format?: string): string {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(value));
      
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      
      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(value));
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      default:
        if (type === 'number') {
          return Number(value).toLocaleString();
        }
        return String(value);
    }
  }

  /**
   * Check if a field path is valid for the given data
   */
  static isValidFieldPath(data: any, path: string): boolean {
    return this.getValueByPath(data, path) !== undefined;
  }

  /**
   * Get field type from sample value
   */
  static getFieldType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'object') return 'object';
    return typeof value as 'string' | 'number' | 'boolean';
  }
}
