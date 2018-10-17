/*
TODO:
    - Remove console.log debug messages
*/

if(document.title == "Look Up Classes"){
    // Gives us the HTMLCollection of elements with the class "datadisplaytable"  
    var elements = document.getElementsByClassName("datadisplaytable");

    // One table exists per MSU Selection Page, so only run code if length == 1
    if(elements.length == 1){
        console.log("in 1");
        // This is the summary for each table on each MSU Selection Page
        if(elements[0].summary == "This layout table is used to present the sections found"){
            console.log("in 2");
            // The element (table element) has two children on each MSU Selection Page
            if(elements[0].children.length == 2){
                console.log("in 3");
                console.log(elements[0].children.length);
                performLinking(elements[0].children[1]);
            }else{
                console.log("Not enough children");
            }
        }else{
            console.log("Wrong summary");
        }
    }else{
        console.log("No table element");
    }
}else{
    console.log("Wrong Page Title");
}

function performLinking(mainTbody){
    console.log("main tbody: " + mainTbody.children.length);

    // If the mainTbody element only has 2 children, there are no class listings
    if(mainTbody.children.length < 2){
        // Do something else here
        return;
    }

    var professorIndex = null;

    // This element is the column header on the table
    var columnHeaderElement = mainTbody.children[1];
    
    console.log("columnHeader " + columnHeaderElement.children.length);

    // Loop through the children of the column header element 
    for(var i = 0; i < columnHeaderElement.children.length; i++){
        // If the text of the column header child is equal to "Instructor", save that index of the child
        if(columnHeaderElement.children[i].textContent == "Instructor"){
            professorIndex = i;
            break;
        }
    }

    console.log("Professor Index: " + professorIndex);

    // Start from the third child (index 2). The first two children are always non-course children on MSU Selection page
    for(var x = 2; x < mainTbody.children.length; x++){
        var element = mainTbody.children[x];

        var professor = element.children[professorIndex].textContent;

        console.log(professor);

        /*
         * TODO:
         *  Need to get rid of the (P) at the end (OR ANY LETTER AT END) and need to remove white spaces
         *  Need to queue into a search on RateMyProfessor  (maybe a new function)
         *  If the link/page is FOUND, need to bold the text, make it blue, and then link it
         */
    }


}