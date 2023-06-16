/*
Module to upload a file by chunks.
*/
/* global jsu */

// eslint-disable-next-line no-unused-vars
class ChunkedUpload {
    constructor (options) {
        // Get and check options
        const mandatoryArgs = [
            // File object. File to send using chunked upload.
            'file',

            // String. The URL to send chunks.
            'uploadURL',

            // String. The URL to mark uploads as complete.
            'completeURL'
        ];
        const optionalArgs = {
            // Boolean. Log mesage in console. If null, debug will be enabled if "debug" is in URL hash.
            'debugMode': null,

            // Dictionary. Extra headers for requests.
            'extraHeaders': {},

            // Dictionary. Extra data for requests.
            'extraData': {},

            // Integer. Maximal number of retry for requests.
            'maxRetry': 30,

            // Integer. Delay in ms to wait before retrying a request. Default: 10 s.
            'retryDelay': 10000,

            // Integer. Number of bytes for each chunk. Default: 20 MB.
            'chunkSize': 20000000,

            // String. The suffix to add to the file name before its extension.
            'fileNameSuffix': '',

            // Function. The function to call to report progress. Arguments: <progress: integer 0-100>.
            'progressCallback': null,

            // Function. The function to call after a request has failed and before retrying it.
            // Your function can return a Promise object to be able to control when the request will be retried.
            // Arguments: <xhr: XMLHttpRequest object of the failed request>.
            'retryCallback': null,

            // Function. The function to call if the upload is succeeded. Arguments: <upload id: string>.
            'successCallback': null,

            // Function. The function to call if the upload fails. Arguments: <message: string>.
            'failureCallback': null
        };
        for (const arg of mandatoryArgs) {
            if (!options[arg]) {
                throw new Error('A mandatory argument is missing: "' + arg + '".');
            }
            this[arg] = options[arg];
        }
        for (const arg in optionalArgs) {
            this[arg] = options[arg] !== undefined ? options[arg] : optionalArgs[arg];
        }
        if (this.debugMode === null && window.location.hash.indexOf('debug') !== -1) {
            this.debugMode = true;
        }

        this.sendFile();
    }

    log () {
        if (this.debugMode) {
            console.log.apply(null, arguments);
        }
    }

    onProgress (value) {
        if (this.progressCallback) {
            this.progressCallback(value);
        }
    }

    onRetry (xhrFailed, retryFunction) {
        let promise;
        if (this.retryCallback) {
            promise = this.retryCallback(xhrFailed);
        }
        if (promise === undefined) {
            const self = this;
            promise = new Promise(function (resolve) {
                self.log('Retrying in ' + self.retryDelay + ' ms...');
                setTimeout(resolve, self.retryDelay);
            });
        }
        promise.then(retryFunction);
    }

    onSuccess () {
        if (this.successCallback) {
            this.successCallback(this.uploadId);
        }
    }

    onFailure (message) {
        if (this.failureCallback) {
            this.failureCallback(message);
        }
    }

    sendFile () {
        this.onProgress(0);

        // Upload file
        this.uploadId = null;
        this.fileName = this.file.name;
        if (this.fileNameSuffix) {
            const index = this.fileName.lastIndexOf('.');
            if (index > 0) {
                this.fileName = this.fileName.substring(0, index) + this.fileNameSuffix + this.fileName.substring(index);
            } else {
                this.fileName = 'file' + this.fileNameSuffix + '.tmp';
            }
        }
        this.log('Number of chunk to send:', Math.ceil(this.file.size / this.chunkSize), this.chunkSize, this.file.size);
        this.sendNextChunk(0, 0);
    }

    sendNextChunk (start, retries) {
        this.log('Sending chunk:', 'start:', start, 'total size:', this.file.size, 'retries:', retries);

        const end = Math.min(start + this.chunkSize, this.file.size);

        const formData = new FormData();
        formData.append('file', this.file.slice(start, end), this.fileName);
        formData.append('retries', retries); // To avoid "Duplicated request aborted" on retry
        if (this.uploadId) {
            formData.append('upload_id', this.uploadId);
        }
        for (const field in this.extraData) {
            formData.append(field, this.extraData[field]);
        }

        const progressStep = (end - start) / this.file.size;
        const headers = Object.assign(
            this.extraHeaders,
            {'Content-Range': 'bytes ' + start + '-' + (end - 1) + '/' + this.file.size}
        );
        this.log('Content-Range', headers['Content-Range']);
        const self = this;
        jsu.httpRequest({
            method: 'POST',
            url: this.uploadURL,
            headers: headers,
            data: formData,
            json: true,
            progress: function (event) {
                if (event.lengthComputable) {
                    let value = start / self.file.size;
                    if (event.total) {
                        value += progressStep * (event.loaded / event.total);
                    }
                    value = Math.floor(95 * value); // Last 5 percents are for complete call
                    self.log('Progress:', value, progressStep, event.loaded, event.total);
                    self.onProgress(value);
                }
            },
            callback: function (xhr, response) {
                if (xhr.status == 200 && response.upload_id) {
                    self.log('Chunk sent', response);
                    self.uploadId = response.upload_id;
                    const nextStart = end;
                    if (nextStart >= self.file.size) {
                        self.completeUpload(0);
                    } else {
                        self.sendNextChunk(nextStart, 0);
                    }
                } else {
                    console.error('Failed to send chunk:', response);
                    if (retries < self.maxRetry) {
                        if (response.offset !== undefined && start !== response.offset) {
                            console.warn('Jumping from offset ' + start + ' to ' + response.offset);
                            start = response.offset;
                        }
                        self.onRetry(xhr, self.sendNextChunk.bind(self, start, retries + 1));
                    } else {
                        self.onFailure(response.error);
                    }
                }
            }
        });
    }

    completeUpload (retries) {
        this.log('Calling complete:', 'expected size:', this.file.size, 'retries:', retries);
        const formData = new FormData();
        formData.append('upload_id', this.uploadId);
        formData.append('expected_size', this.file.size);
        formData.append('retries', retries); // To avoid "Duplicated request aborted" on retry
        for (const field in this.extraData) {
            formData.append(field, this.extraData[field]);
        }

        const self = this;
        jsu.httpRequest({
            method: 'POST',
            url: this.completeURL,
            headers: this.extraHeaders,
            data: formData,
            json: true,
            callback: function (xhr, response) {
                if (xhr.status == 200 && response.upload_id) {
                    self.log('Complete succeeded:', response);
                    self.onProgress(100);
                    self.onSuccess();
                } else {
                    console.error('Failed to call complete:', response);
                    if (retries < self.maxRetry) {
                        self.onRetry(xhr, self.completeUpload.bind(self, retries + 1));
                    } else {
                        self.onFailure(response.error);
                    }
                }
            }
        });
    }
}
