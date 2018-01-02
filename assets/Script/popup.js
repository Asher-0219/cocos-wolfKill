cc.Class({
    extends: cc.Component,

    properties: {
        popText:{
            default:null,
            type:cc.Label
        },
        time:0
    },

    // use this for initialization
    onLoad: function () {
        // this.node.parent.active = true;
    },
    init:function(data){
        this.popText.string = data.text;
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.time += dt;
        if(this.time>2){
            this.node.destroy();
        }
    },
});
