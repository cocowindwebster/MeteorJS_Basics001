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
    
    //bind data to this Template, named "my_image"
    // instead of passing an ARRAY called image_data, pass a property that 
    // has KEY "images", and VALUE "image_data"
    // with this property structure, html TEMPLATE can iterate
    // looks like a comma ending a line, can be either omitted or kept
    //Template.my_image.helpers({images:image_data}); 
    Template.my_image.helpers({images:
                              Images.find(
                                  //{}, {sort:{rating:-1}}
                                  {}, {sort:{createdOn : -1, rating : -1}} // sort by the date first, then by the rating
    )}); 

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

        'click .js-show-image-form':function() {
            $("#image_add_form").modal("show");
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
            Images.insert({
                image_source:img_src,
                image_alt:img_alt,
                createdOn: new Date()
            });
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
