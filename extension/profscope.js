
// Initialize a collection that will be used to keep track of currently collected professors
var currentProfCollection = [];

if(document.title == "Look Up Classes"){
    // Gives us the HTMLCollection of elements with the class "datadisplaytable"  
    var elements = document.getElementsByClassName("datadisplaytable");

    // One table exists per MSU Selection Page, so only run code if length == 1
    if(elements.length == 1){
        // This is the summary for each table on each MSU Selection Page
        if(elements[0].summary == "This layout table is used to present the sections found"){
            // The element (table element) has two children on each MSU Selection Page
            if(elements[0].children.length == 2){
                // Clear n
                currentProfCollection = [];
                professorLinker(elements[0].children[1]);
            }
        }
    }
}


function professorLinker(mainTbody){
    var collectedProfs = [];

    // If the mainTbody element only has 2 children, there are no class listings
    if(mainTbody.children.length < 2){
        // Do something else here
        return;
    }

    var professorIndex = null;

    // This element is the column header on the table
    var columnHeaderElement = mainTbody.children[1];
    
    // Loop through the children of the column header element 
    for(var i = 0; i < columnHeaderElement.children.length; i++){
        // If the text of the column header child is equal to "Instructor", save that index of the child
        if(columnHeaderElement.children[i].textContent == "Instructor"){
            professorIndex = i;
            break;
        }
    }

    // Start from the third child (index 2). The first two children are always non-course children on MSU Selection page
    for(var x = 2; x < mainTbody.children.length; x++){
        var element = mainTbody.children[x];

        var professor = element.children[professorIndex].textContent;

        professor = professor.substring(0, professor.indexOf("(")).trim().split(" ");
        console.log(professor);
        if(professor.length == 4){
            var firstName = professor[0].toString();
            var lastName = professor[3].toString();
            var fullName = lastName + " " + firstName;

            //TODO: Add checks/manipulation for names with '-' in them
            if(!collectedProfs.includes(fullName) && (!fullName.includes('-'))){
                // Link
                getRMPLink(firstName, lastName);
                collectedProfs.push(fullName);
                
            }
        }
        /*
         * TODO:
         *  If the link/page is FOUND, need to bold the text, make it blue, and then link it
         */
    }
}

function getRMPLink(firstName, lastName){
    var xhttp = new XMLHttpRequest();
    var method = "POST";
    
    // Make sure the URL has "https" in it to avoid MixedContent... error
    var url = "https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=montclair%20state%20university&queryoption=HEADER&query=" 
        + lastName + "%20" + firstName + "&facetSearch=true";
    
    var response = "";
    
    // On load of the xhttp request, set response equal to the responseText of the xhttp request
    xhttp.onload = function(){
        response = xhttp.responseText;
    };
    // Initiate the request
    xhttp.open(method, url, true);
    xhttp.send('');

    // A short delay to simply make sure that xhttp.onload() has fully been called --> prevent response from being undefined
    setTimeout(function(){
        // Create a temporary div that will act as the holder for retrieving the direct URL for the professors RMP page
        var div = document.createElement('div');
        // Remove all (/g) script tags within the response text --> greatly reduces the size of the responseText
        response = response.replace(/<script(.|\s)*?\/script>/g, '');
        div.innerHTML = response;
        // The "listing PROFESSOR" class houses the results on the page of our xhttp request
        var listingsClass = div.getElementsByClassName("listing PROFESSOR")[0];
        // Check to make sure that the first element of the HTMLCollection is not undefined
        if(listingsClass != undefined){
            // Check to make sure that the first element of HTMLCollection is not undefined
            listingsClass = listingsClass.getElementsByTagName('a')[0];
            if(listingsClass != undefined){
                // The specific url is: RMP.com + the href of the listing
                var specificURL =  "http://www.ratemyprofessors.com" + listingsClass.getAttribute('href');
                console.log(specificURL);  
            }
        }else{
            console.log("Error on EMP Listing --> Prof. reviews do not exist?");
        }
    }, 500);
}
