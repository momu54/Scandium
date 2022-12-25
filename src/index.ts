const files = Deno.readDir('./src/cmd/');

for await (const file of files) {
	if (!file.isFile || !file.name.endsWith('.ts')) continue;
	import(`./cmd/${file.name}`).then(() =>
		console.log(`[info] Success loading file ./src/cmd/${file.name}`)
	);
}
