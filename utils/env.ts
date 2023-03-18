export function CheckEnv() {
	const {
		token,
		supportguild,
		clientid,
		clientsecret,
		callbackurl,
		callbackport,
		intaiwan,
	} = process.env;

	if (
		!token ||
		!supportguild ||
		!clientid ||
		!clientsecret ||
		!callbackurl ||
		!callbackport ||
		!intaiwan
	) {
		console.error('[env/error] Missing environment variables');
		console.log('[env/info] You can use .env.example as a template');
		console.log(
			`[env/info] Please add missing environment variables to .env file and press any key to continue`
		);
		process.exit(-1);
	}
}
