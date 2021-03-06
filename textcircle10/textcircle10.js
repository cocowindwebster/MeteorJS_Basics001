this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
    Meteor.subscribe("documents");
    Meteor.subscribe("editingUsers");
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
                    Meteor.call("addEditingUser");
                } );
            }   
        }

    })

    Template.editingUsers.helpers({
        users:function() {
            var doc, eusers, users;
            doc = Documents.findOne();
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
} //end isClient

if (Meteor.isServer) {
    Meteor.startup(function () {
      if (!Documents.findOne()) {
          Documents.insert({title : "my new documents"});
      }
    });
    //why the filtering of "isPrivate:false" should be in the server?
    //if it is in the client, then malicious user can steal using the console to get those information. This is insecure.
    Meteor.publish("documents", function(){
        return Documents.find({
            $or: [
                {isPrivate:false}, 
                {owner:this.userId}
            ]
        });
    });

    Meteor.publish("editingUsers", function(){
        return EditingUsers.find();
    })
}

// You can regard Meteor.methods as a way to control WRITE access to the database.
// publish and substribe is to control READ access to the database.
Meteor.methods({
    addDoc:function(){
       var doc;
       if (!this.userId) {
           return;
       } else {
           doc = {owner:this.userId, createdOn:new Date(), title:"my new doc"};
           var id = Documents.insert(doc);
           console.log("addDoc method got an id : " + id);
           return id;
       }

    
    },

    updateDocPrivacy:function(doc){
        console.log("updateDocPrivacy method");
        console.log(doc);
        var realDoc = Documents.findOne({_id : doc._id});
        if (realDoc) {
            realDoc.isPrivate = doc.isPrivate;
            Documents.update({_id : doc._id}, realDoc);
        }
    },

    addEditingUser:function(){
        var doc, user, eusers;
        doc = Documents.findOne();
        if (!doc) {return;} //no doc, so return
        if (!this.userId) {return;} //no user, so return
        user = Meteor.user().profile;
        eusers = EditingUsers.findOne({docid:doc._id});
        if (!eusers) {
            eusers = {
                docid:doc._id,
                users:{},
            }; 
        }
        user.lastEdit = new Date();
        eusers.users[this.userId] = user;
        EditingUsers.upsert({_id:eusers._id},eusers); //upsert : insert only if it is not existed.
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
