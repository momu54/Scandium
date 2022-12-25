export function snowflakeToTimestamp(id: bigint) {
	return Number(id / 4194304n + 1420070400000n);
}

export function TransformLangIso639_1(code: string) {
	const result = code
		.replace('-GB', '')
		.replace('-US', '')
		.replace('-BR', '')
		.replace('-ES', '')
		.replace('-SE', '')
		.toLowerCase();

	return result;
}
