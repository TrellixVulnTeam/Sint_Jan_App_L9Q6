var Filesystem = {};
Filesystem.WriteFile = (path, data) => {
	return new Promise((resolve, reject) => {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(path, { create: true, exclusive: false }, function (fileEntry) {
				fileEntry.createWriter(function (fileWriter) {
					fileWriter.onwriteend = resolve
					fileWriter.onerror = reject
					var dataObj = new Blob([JSON.stringify(data)], { type: 'application/json' });
					fileWriter.write(dataObj);
				});
			});
		});
	});
}
Filesystem.ReadFile = (path) => {
	return new Promise((resolve, reject) => {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(path, { create: true, exclusive: false }, function (fileEntry) {
				fileEntry.file(function (file) {
					var reader = new FileReader();
					reader.onloadend = function () {
						try {resolve(JSON.parse(this.result))
						} catch (error) {reject(error)}
					};
					reader.readAsText(file);
				}, reject);
			});
		});
	});
}