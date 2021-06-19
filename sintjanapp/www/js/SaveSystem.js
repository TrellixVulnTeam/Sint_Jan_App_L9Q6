class SaveSystem {
    static GetFile(fileName) {
        return new Promise((resolve, reject) => {
            var fileSys = new SaveSystem();
            fileSys.fileName = fileName;
            fileSys.fileEntry = null;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {//get a filesystem object
                fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {//creates a file object
                    fileSys.fileEntry = fileEntry;
                    resolve(fileSys);
                }, reject);
            }, reject);
        });
    }
    SaveJSON(json) {//saves json data
        return new Promise((resolve, reject) => {
            this.fileEntry.createWriter(function (fileWriter) {//create a file writer
                fileWriter.onwriteend = resolve;
                fileWriter.onerror = reject;
                fileWriter.write(new Blob([JSON.stringify(json)], { type: 'text/plain' }));//write blob to file
            });
        });
    }
    loadJSON() {//load json data from file
        return new Promise((resolve, reject) => {
            this.fileEntry.file(function (file) {//create file object
                var reader = new FileReader();//create file reader
                reader.onloadend = function () {//when done reading the file
                    var obj = null;
                    try {//try to create a json object from the text in the file (if an error ocures obj will stay null)
                        obj = JSON.parse(this.result);
                    } catch (e) { reject(e); }
                    resolve(obj);
                };
                reader.readAsText(file);//starts reading
            }, reject);
        });
    }
}