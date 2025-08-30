import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * Utility functions for seeding the database
 */
export class SeedUtils {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Hash a password for secure storage
   */
  async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  /**
   * Generate a random number between min and max (inclusive)
   */
  randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random date between start and end
   */
  randomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  /**
   * Format a date as YYYY-MM-DD
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate Lorem Ipsum text of a specified length
   */
  loremIpsum(paragraphs: number = 3): string {
    const loremText = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl nec nisl. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl nec nisl.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
      'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
    ];

    let result = '';
    for (let i = 0; i < paragraphs; i++) {
      result += loremText[i % loremText.length] + '\n\n';
    }
    return result.trim();
  }

  /**
   * Pick a random item from an array
   */
  randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Pick multiple random items from an array
   */
  randomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Clean up the database (delete all records in the correct order)
   */
  async cleanDatabase(): Promise<void> {
    console.log('🧹 Cleaning up existing data...');
    
    // Delete in order to respect foreign key constraints
    await this.prisma.like.deleteMany({});
    await this.prisma.comment.deleteMany({});
    await this.prisma.file.deleteMany({});
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.order.deleteMany({});
    await this.prisma.product.deleteMany({});
    await this.prisma.productCategory.deleteMany({});
    await this.prisma.blogPost.deleteMany({});
    await this.prisma.address.deleteMany({});
    await this.prisma.category.deleteMany({});
    await this.prisma.systemSettings.deleteMany({});
  }
}
