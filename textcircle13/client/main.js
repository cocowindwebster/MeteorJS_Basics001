Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");

Router.configure({
    layoutTemplate:'ApplicationLayout'
});

Router.route('/', function(){
    console.log("You hit /");
    this.render("navbar", {to:"header"});
    this.render("docList", {to:"main"});
})


Router.route('/documents/:_id', function(){
    console.log("You hit /document" + this.params._id);
    Session.set("docid", this.params._id);
    this.render("navbar", {to:"header"});
    this.render("docItem", {to:"main"});
})

Template.editor.helpers({
    docid:function() {
        setupCurrentDocument();
        return Session.get("docid");
    },
    config:function() {
        return function(editor) {
            editor.setOption("lineNumbers", true);
            editor.setOption("mode", "html");
            editor.setOption("theme", "dracula");
            editor.on("change", function(cm_editor, info){
                console.log(cm_editor.getValue());
                $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
                Meteor.call("addEditingUser", Session.get("docid"));
            } );
        }
    },
});

Template.editingUsers.helpers({
    users:function() {
        var doc, eusers, users;
        doc = Documents.findOne({_id:Session.get("docid")});
        if (!doc) {
            return;
        }
        eusers = EditingUsers.findOne({docid : doc._id});
        if (!eusers) {
            return;
        }
        users = new Array();
        var i = 0;
        for (var user_id in eusers.users) {
            console.log("Adding User");
            console.log(eusers.users[user_id]);
            users[i] = eusers.users[user_id];
            i++;
        }
        return users;
    }
})

Template.navbar.helpers({
    documents:function (){
        //return Documents.find({isPrivate:false});
        return Documents.find();
    }
})

Template.docMeta.helpers({
    document:function () {
        return Documents.findOne({_id:Session.get("docid")});
    },
    canEdit:function() {
        var doc;
        doc = Documents.findOne({_id:Session.get("docid")});
        if (doc) {
            if (doc.owner == Meteor.userId()) {
                return true;
            }
        }
        return false;
    }
})

Template.editableText.helpers({
    userCanEdit : function(doc, connection) {
        //can edit if the current doc is owned by Me
        doc = Documents.findOne({_id : Session.get("docid"), owner : Meteor.userId()});
        if (doc){
            return true;
        } else {
            return false;
        }
    }
})

Template.docList.helpers({
    documents:function(){
        return Documents.find();
    }
})

Template.insertCommentForm.helpers({
    docid:function(){
        return Session.get("docid");
    }
})

////////////
///events
////////////

Template.navbar.events({
    "click .js-add-doc":function(event) {
        event.preventDefault();
        console.log("Add a new doc");
        if (!Meteor.user()) { //check if user is login, from client.
            alert("You need to login first!");
        } else {
            //var id = Meteor.call("addDoc");
            var id = Meteor.call("addDoc", function(err, res){
                if (!err) {
                    console.log("event callback received id : " + res);
                    Session.set("docid", res);
                }
            });
        }
    },
    "click .js-load-doc":function(event) {
        console.log(this);
        Session.set("docid", this._id)
    }
})
Template.docMeta.events({
    "click .js-tog-private":function(event) {
        console.log(event.target.checked);
        var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
        console.log("doc is ->");
        console.log(doc)
        Meteor.call("updateDocPrivacy", doc);
    }
})



function setupCurrentDocument() {
   var doc;
   if (!Session.get("docid")) {
       doc = Documents.findOne();
       if (doc) {
           Session.set("docid", doc._id);
       }
   }
}
