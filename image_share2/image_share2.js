Images = new Mongo.Collection("images");
console.log(Images.find().count());


if (Meteor.isClient) {
    console.log("This is at client")
    var image_data = [
    {
        image_source : "1.png",
        image_alt : "One large hot air balloon"
    },
    {
        image_source : "2.png",
        image_alt : "Two large hot air balloons"

    },
    {
        image_source : "3.png",
        image_alt : "All large hot air balloons"
    }
    ];
    
    //call a funciton, and some properties as argument.
    Accounts.ui.config({
        passwordSignupFields : "USERNAME_AND_EMAIL"
    });

    //bind data to this Template, named "my_image"
    // instead of passing an ARRAY called image_data, pass a property that 
    // has KEY "images", and VALUE "image_data"
    // with this property structure, html TEMPLATE can iterate
    // looks like a comma ending a line, can be either omitted or kept
    //Template.my_image.helpers({images:image_data}); 
    Template.my_image.helpers({
        images: function(){
           if (Session.get("userFilter")) {
              return Images.find({createdBy:Session.get("userFilter")}, {sort : {createdOn : -1, rating : -1}});
           } else {
              return Images.find({}, {sort:{createdOn : -1, rating : -1}});    // sort by the date first, then by the rating
           }
        },

        filtering_images:function() {
            if (Session.get("userFilter")) {
                return true;
            } else {
                return false;
            }
        },

        getUser:function (user_id) {
           var user = Meteor.users.findOne({_id:user_id}); 
           if (user) {
               return user.username;
           } else {
               return "anonymous";
           }
        },

        getFilterUser:function (user_id) {
           if (Session.get("userFilter")) {
                var user = Meteor.users.findOne({_id:Session.get("userFilter")}); 
                return user.username;
           } else {
                return "anonymous";
           }
        }
    }); 
    
    // the template tag can be either default, ie. "body", or custumized, ie. "my_image".
    Template.body.helpers({username: function(){
           // the way to access users is by calling Meteor built-in function.
           // Meteor.user() is a REACTIVE data source. This means:
           // Meteor is rander the template as quickly as possible, so it will print this log before it detects a user is logged in.
           // Once it detects a user is logged in, the data that Meteor template is depending on is changed. In reactive model, this change
           // of data will make the Meteor template to render again.
           // hence the console.log will give two output 
           // Exception in template helper: TypeError: Cannot read property 'emails' of undefined
           // test@test.com
           //console.log(Meteor.user().emails[0].address);
            
            //quick fix: add a if condition
            //Javascript: as long as it is NOT "false" and as long as it is NOT "undefined". the if block will execute. so it can  a value besides “true”.
           if (Meteor.user()) {
               console.log(Meteor.user().emails[0].address );
               return Meteor.user().username;
           } else {
               return "anonymous"
           }
        }
    }); 


    Template.my_image.events({
        //bind event lisenter to this Template, named "my_image"
        'click .js-image':function(event) {
             alert("hello");
             console.log(event);
             console.log(event.originalEvent.clientX);
             $(event.target).css("width", "50px");
        }, 
        
        // id is the ID for an item in Mongo Collection
        // this is data which the template was displaying (i.e. image)
        'click .js-del-image':function(event){
            var image_id = this._id; 
            console.log("js-del-image, image_id=" + image_id)   
            //use JQuery to hide the picture slowly, then delete it
            $("#"+image_id).hide("show", function(){
                Images.remove({"_id":image_id});
            });
        },

        'click .js-rate-image':function(event){
            var rating = $(event.currentTarget).data("userrating");
            var image_id = this.id;
            console.log("js-rate-image, you clicked a star, rating = " + rating + ", image_id = " + image_id);
            Images.update({"_id":image_id}, {$set:{rating:rating}});
             
        },

        'click .js-show-image-form':function(event) {
            $("#image_add_form").modal("show");
        },

        'click .js-set-image-filter':function(event) {
            //this is the data context for the template in which the event is occured. 
           Session.set("userFilter", this.createdBy); 
        },

        'click .js-unset-image-filter':function(event) {
           Session.set("userFilter", undefined); 
        }
    });

    Template.image_add_form.events({
        'submit .js-add-image':function(event) {
            var img_src, img_alt;
            //when deal with FORM, you don't need JQuery to access DOM elements.
            img_src = event.target.img_src.value;
            //img_src = img_src.substring(8);
            img_alt = event.target.img_alt.value;
            console.log("src : " +  img_src + ", alt : " + img_alt);
            if (Meteor.user()) {
                Images.insert({
                    image_source:img_src,
                    image_alt:img_alt,
                    createdOn: new Date(),
                    createdBy: Meteor.user()._id
                });
            }
            $("#image_add_form").modal("hide");
            return false; // if you omit this line, the browser will just reload after the submit button is created. "return a false value" is a usual practice when dealding with form submission.
        }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    console.log("This is at server")
  });
}
