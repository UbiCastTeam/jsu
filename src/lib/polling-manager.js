export class PollingManager {
    constructor (fct, interval, enabled) {
        /*
        This class purpose is to handle a function used for polling.
        The polling will be stopped when page is hidden and restarted if visible.
        Arguments:
        - `fct`:
            The function to use for the polling.
            It will receive a callback function as argument which must be
            called once the function is done (after a request for example).
        - `interval`:
            The interval is the time between the end of the execution of the
            function and the next execution of the function.
            This means that the execution duration of the function will delay
            the next run.
        - `enabled`:
            Boolean to indicate if the polling should be initially enabled.
            Default is `true`.
        */
        this.enabled = false;
        this.timeoutId = null;
        this.running = false;
        this.lastRun = 0;
        this.interval = interval;
        this.fct = fct;

        if (enabled === undefined || enabled === true) {
            this.enable();
        }
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                this.resume();
            } else {
                this.cancel();
            }
        }.bind(this));
    }
    enable () {
        if (!this.enabled) {
            this.enabled = true;
            this.resume();
        }
    }
    disable () {
        if (this.enabled) {
            this.enabled = false;
            this.cancel();
        }
    }
    run () {
        if (this.enabled && !this.running) {
            this.running = true;
            this.cancel();
            this.fct(function (planNext) {
                this.lastRun = (new Date()).getTime();
                this.running = false;
                if (planNext === undefined || planNext === true) {
                    this.plan(this.interval);
                }
            }.bind(this));
        }
    }
    plan (delay) {
        if (this.enabled && !this.timeoutId && document.visibilityState === 'visible') {
            this.timeoutId = setTimeout(this.run.bind(this), delay);
        }
    }
    resume () {
        const now = (new Date()).getTime();
        const delay = Math.max(this.lastRun + this.interval - now, 1);
        this.plan(delay);
    }
    cancel () {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}
