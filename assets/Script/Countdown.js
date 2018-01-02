cc.Class({
    extends: cc.Component,

    properties: {
        timeToRecover: 0,
        labelTimer: {
            default: null,
            type: cc.Label
        },
    },

    // use this for initialization
    onLoad: function () {
        this.timer = 0;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        let timeLeft = Math.floor(this.timeToRecover - this.timer);
        this.labelTimer.string = timeLeft%60;
        this.timer += dt;
    }
});