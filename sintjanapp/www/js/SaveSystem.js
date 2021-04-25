class SaveSystem{
    constructor(fileName,onReady,onErrorCreateFile,onErrorLoadFs){
        this.fileName = fileName;
        this.fileEntry = null;
        var fileSys = this;
        SaveSystem.GetFile(fileName,function(fileEntry){fileSys.fileEntry = fileEntry;onReady();},onErrorCreateFile,onErrorLoadFs);
    }
    static GetFile(fileName,useFileEntry,onErrorCreateFile,onErrorLoadFs){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {//gets a filesystem object
            fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {//creates a file object
                useFileEntry(fileEntry);
            }, onErrorCreateFile);
        }, onErrorLoadFs);
    }
    SaveJSON(json,onDone,onErrorWriteFile){//saves login data (error has input)
        this.fileEntry.createWriter(function (fileWriter) {//create a file writer
            fileWriter.onwriteend = function() {
                if(onDone != null)
                    onDone();
            };
            fileWriter.onerror = onErrorWriteFile;
            fileWriter.write(new Blob([JSON.stringify(json)], { type: 'text/plain' }));//write blob to file
        });
    }
    loadJSON(afterload,onErrorReadFile){//load login data from file (error has input)
        this.fileEntry.file(function (file) {//create file object
            var reader = new FileReader();//create file reader
            reader.onloadend = function() {//read file
                var obj = null;
                obj = JSON.parse(this.result);
                afterload(obj);
            };//calls function when done reading
            reader.readAsText(file);//starts reading
        }, onErrorReadFile);
    }
}