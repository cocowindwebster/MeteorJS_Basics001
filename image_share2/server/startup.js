Meteor.startup(function(){
    if (Images.find().count() == 0) {
        for (var i = 1; i < 23; i++) {
            Images.insert(
                {
                    image_source : "img_" + i + ".jpg",
                    image_alt : "image number : " + i
                }
            );
            console.log("startup.js, " + Images.find().count())
        }
    }
});
