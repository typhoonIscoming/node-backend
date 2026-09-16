class ApiResponse {
	constructor(message = 'success', data = null, status = 200) {
		this.status = status;
		this.message = message;
		this.data = data;
	}

	static success(message = 'success', data = null, status = 200) {
		return {
			status,
			message,
			data,
			timestamp: new Date().toISOString(),
		};
	}

	static error(message = 'error', status = 500) {
		return {
			status,
			message,
			data: null,
			timestamp: new Date().toISOString(),
		};
	}
}

exports.module = ApiResponse;
