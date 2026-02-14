"use strict";
/**
 * Database Package
 *
 * Exports the Prisma client for database access.
 * Uses singleton pattern to ensure single connection pool.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = global.prisma ?? new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
__exportStar(require("@prisma/client"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7Ozs7Ozs7Ozs7Ozs7OztBQUVILDJDQUE4QztBQVdqQyxRQUFBLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUkscUJBQVksQ0FBQztJQUN0RCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssYUFBYTtRQUN6QyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Q0FDZCxDQUFDLENBQUM7QUFFSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsY0FBTSxDQUFDO0FBQ3pCLENBQUM7QUFFRCxpREFBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERhdGFiYXNlIFBhY2thZ2VcbiAqIFxuICogRXhwb3J0cyB0aGUgUHJpc21hIGNsaWVudCBmb3IgZGF0YWJhc2UgYWNjZXNzLlxuICogVXNlcyBzaW5nbGV0b24gcGF0dGVybiB0byBlbnN1cmUgc2luZ2xlIGNvbm5lY3Rpb24gcG9vbC5cbiAqL1xuXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XG5cbi8vIFByaXNtYUNsaWVudCBpcyBhdHRhY2hlZCB0byB0aGUgYGdsb2JhbGAgb2JqZWN0IGluIGRldmVsb3BtZW50IHRvIHByZXZlbnRcbi8vIGV4aGF1c3RpbmcgeW91ciBkYXRhYmFzZSBjb25uZWN0aW9uIGxpbWl0LlxuLy8gTGVhcm4gbW9yZTogaHR0cHM6Ly9wcmlzLmx5L2QvaGVscC9uZXh0LWpzLWJlc3QtcHJhY3RpY2VzXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXZhclxuICB2YXIgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBjb25zdCBwcmlzbWEgPSBnbG9iYWwucHJpc21hID8/IG5ldyBQcmlzbWFDbGllbnQoe1xuICBsb2c6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnIFxuICAgID8gWydxdWVyeScsICdlcnJvcicsICd3YXJuJ10gXG4gICAgOiBbJ2Vycm9yJ10sXG59KTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZ2xvYmFsLnByaXNtYSA9IHByaXNtYTtcbn1cblxuZXhwb3J0ICogZnJvbSAnQHByaXNtYS9jbGllbnQnOyJdfQ==