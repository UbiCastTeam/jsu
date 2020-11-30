function AudioUtils (options) {
    this.audioContext = new AudioContext();
    this.audio = options.audio;
    this.silent = options.silent || false;

    this.audioSource = null;
    this.splitter = null;
    this.merger = null;
    this.init();
}
AudioUtils.prototype.init = function () {
    if (!this.audioSource) {
        if (this.audio instanceof MediaStream) {
            this.audioSource = this.audioContext.createMediaStreamSource(this.audio);
        } else {
            this.audioSource = this.audioContext.createMediaElementSource(this.audio);
        }
    }
    this.splitter = this.audioContext.createChannelSplitter();
    this.audioSource.connect(this.splitter);
    this.merger = this.audioContext.createChannelMerger(1);
    this.gainNodes = [];
    for (let i = 0; i < this.splitter.numberOfOutputs; i++) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1;
        this.gainNodes.push(gainNode);
    }
    for (let i = 0; i < this.splitter.numberOfOutputs; i++) {
        this.splitter.connect(this.gainNodes[i], i);
        this.gainNodes[i].connect(this.merger, 0, 0);
    }
    if (!this.silent) {
        this.merger.connect(this.audioContext.destination);
    }
};
AudioUtils.prototype.audioMeter = function (callback, accuracy) {
    /*
        Create mic preview
    */
    if (!accuracy) {
        accuracy = 50;
    }
    let maxLevelL = 0;
    let oldLevelL = 0;

    const javascriptNode = this.audioContext.createScriptProcessor(1024, 1, 1);

    this.audioSource.connect(javascriptNode);
    javascriptNode.connect(this.audioContext.destination);

    let running = false;
    javascriptNode.onaudioprocess = function (event) {
        const inptL = event.inputBuffer.getChannelData(0);
        let instantL = 0.0;

        let sumL = 0.0;
        for (let i = 0; i < inptL.length; ++i) {
            sumL += inptL[i] * inptL[i];
        }
        instantL = Math.sqrt(sumL / inptL.length);
        maxLevelL = Math.max(maxLevelL, instantL);
        instantL = Math.max(instantL, oldLevelL - 0.008);
        oldLevelL = instantL;
        const percent = Math.ceil((instantL / maxLevelL) * 100);
        if (percent >= 0) {
            if (!running) {
                running = true;
                setTimeout(function () {
                    running = false;
                    callback(percent);
                }, accuracy);
            }
        }
    };
    this.audioSource.onended = function () {
        this.audioSource.disconnect(javascriptNode);
        javascriptNode.disconnect(this.audioContext.destination);
    };
};
AudioUtils.prototype.applyVolumeToChannel = function (channel, volume) {
    this.gainNodes[channel].gain.value = volume;
};
