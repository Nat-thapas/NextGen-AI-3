import type { Session } from '$lib/server/interfaces/session';
import type { User } from '$lib/server/interfaces/user';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token?: string;
			user?: User;
			session?: Session;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'success' | 'info' | 'warning' | 'error';
				text: string;
			};
		}
	}
}

export {};
