import { customType } from 'drizzle-orm/pg-core';
import { v4 as uuid, parse as uuidParse, stringify as uuidStringify } from 'uuid';

import { base64UrlDecode, base64UrlEncode } from './base64url';

export function uuidToSuid(uuid: string): string {
	return base64UrlEncode(uuidParse(uuid));
}

export function suidTouuid(suid: string): string {
	return uuidStringify(new Uint8Array(base64UrlDecode(suid)));
}

export function generateSuid(): string {
	return uuidToSuid(uuid());
}

export const suid = customType<{ data: string; driverData: string }>({
	dataType() {
		return 'uuid';
	},
	fromDriver(uuid: string): string {
		return uuidToSuid(uuid);
	},
	toDriver(suid: string): string {
		return suidTouuid(suid);
	}
});
