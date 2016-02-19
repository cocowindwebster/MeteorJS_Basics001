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
                editor.setOption("lineNumber", true);
                editor.setOption("mode", "html");
                editor.on("change", function(cm_editor, info){
                    console.log(cm_editor.getValue());
                    $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
                    Meteor.call("addEditingUser");
                } );
            }   
        }

    });
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
        doc = Documents.findOne();
        if (!doc) {return;} //no doc, so return
        if (!this.userId) {return;} //no user, so return
        user = Meteor.user().profile;
        eusers = EditingUsers.findOne({docid:doc._id});
        if (!eusers) {
            eusers = {
                docid:doc._id,
            }; 
        }
        EditingUsers.upsert({_id:eusers._id},eusers); //upsert : insert only if it is not existed.
    }
}) 
