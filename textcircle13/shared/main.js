// You can regard Meteor.methods as a way to control WRITE access to the database.
// publish and substribe is to control READ access to the database.

Meteor.methods({
    addComment:function(comment){
        console.log("addComment method running")
        if (this.userId) {
            comment.createdOn = new Date();
            comment.userId = this.userId;
            comment.owner = this.userId;
            return Comments.insert(comment);
        }
        return;
    },

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

    addEditingUser:function(docid){
        var doc, user, eusers;
        doc = Documents.findOne({_id:docid});
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
