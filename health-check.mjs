import http from 'node:http';

const options = process.env.SOCKET_PATH
	? {
			socketPath: process.env.SOCKET_PATH,
			path: `${process.env.PUBLIC_BASE_PATH}/api/health`,
			method: 'GET',
			timeout: 100 // 100 ms.
		}
	: {
			hostname: 'localhost',
			port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
			path: `${process.env.PUBLIC_BASE_PATH}/api/health`,
			method: 'GET',
			timeout: 100 // 100 ms.
		};

const req = http.request(options, (res) => {
	const status = res.statusCode;
	if (status >= 500) {
		process.exit(1);
	} else {
		process.exit(0);
	}
});

req.on('error', () => {
	process.exit(1);
});

req.on('timeout', () => {
	req.destroy();
	process.exit(1);
});

req.end();
