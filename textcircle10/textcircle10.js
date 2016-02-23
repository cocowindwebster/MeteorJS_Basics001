this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
    Template.editor.helpers({
        docid:function() {
            var doc = Documents.findOne();
            if (doc) {
                return doc._id;
            } else {
                return undefined;
            }
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

    });


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
    });

    ////////////
    ///events
    ////////////

    Template.navbar.events({
        "click .js-add-doc":function(event) {
            event.preventDefault();
            console.log("Add a new doc");
        } 
    })
    
}

if (Meteor.isServer) {
    Meteor.startup(function () {
      if (!Documents.findOne()) {
          Documents.insert({title : "my new documents"});
      }
  });
}

Meteor.methods({
    addEditingUser:function(){
        var doc, user, eusers;
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
