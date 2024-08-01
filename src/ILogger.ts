export interface ILogger {
	debug(...any: any[]): void;
	error(...any: any[]): void;
	info(...any: any[]): void;
	warn(...any: any[]): void;
	always(...any: any[]): void;
}
