if(document.title == "Look Up Classes"){
    // Gives us the HTMLCollection of elements with the class "datadisplaytable"  
    var elements = document.getElementsByClassName("datadisplaytable");

    // One table exists per MSU Selection Page, so only run code if length == 1
    if(elements.length == 1){
        // This is the summary for each table on each MSU Selection Page
        if(elements[0].summary == "This layout table is used to present the sections found"){
            // The element (table element) has two children on each MSU Selection Page
            if(elements[0].children.length == 2){
                professorLinker(elements[0].children[1]);
            }
        }
    }
}

/**
 * Extracts each professor from the MSU selection page for that course and links them with their RMP review link/scores
 * Async so that we can utilize the await feature -> Used with our Promise handling
 * @param {object} mainTbody 
 */
async function professorLinker(mainTbody){
    var collectedProfsMap = new Map();

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
    
    // If the professorIndex is still null, there is no listing of professors on the page, so we return
    if(professorIndex == null){
        console.log("No Valid Professor Index");
        return;
    }

    // Start from the third child (index 2). The first two children are always non-course children on MSU Selection page
    for(var x = 2; x < mainTbody.children.length; x++){
        var element = mainTbody.children[x];

        var professorElement = element.children[professorIndex];
        var professorRoughText = professorElement.textContent;
        
        // Skip the code if the text is simply a "TBA" placeholder
        if(professorRoughText === "TBA") continue;

        //var professor = professorElement.textContent;
        var professor = professorRoughText.substring(0, professorRoughText.indexOf("(")).trim().split(" ");
        //console.log(professor);
        if(professor.length == 4){
            var firstName = professor[0].toString();
            var lastName = professor[3].toString();
            var fullName = lastName + " " + firstName;

            // If the Map contains a professor by their full name, no need to repeat the link search process
                //TODO: Add checks/manipulation for names with '-' in them
            if(!collectedProfsMap.has(fullName) && (!fullName.includes('-'))){
                // Try to get the link. An error will be thrown if a link does not exist (from the reject(...) in the promise)
                try {
                    /*
                        Get the professor-RMP link by running the getRMPLink function. 
                        We await() so that a return value is given after the function is completely done.
                    */
                    var profRMPLink = await getRMPLink(firstName, lastName);
                }catch(error){
                    // If a professor does not have a RMP link, store their name in the map with the value of "no_link"
                    collectedProfsMap.set(fullName, "no_link");
                    console.log("Error on EMP Listing --> Prof. reviews do not exist?");
                    continue;
                }

                console.log(profRMPLink);
                // Save the professor (by full name) and their RMP link in a Map
                collectedProfsMap.set(fullName, profRMPLink);
            }
            if(collectedProfsMap.get(fullName) !== "no_link"){
                modifyElement(professorElement, profRMPLink, professorRoughText);
            }
        }
    }
}

/**
 * Retrieves the RateMyProfessor link (if it exists) for the professor with (firstName+lastName) as a name
 * @param {string} firstName 
 * @param {string} lastName 
 */
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

    /*
        Instantiate a Promise that will handle the return of the professor-specific URL inside of setTimeout.
        The Promise allows us to return this information without having the function return before the setTimeout is complete.
    */
    var promise = new Promise(function(resolve, reject){
        // A short delay to simply make sure that xhttp.onload() has fully been called --> prevent response from being undefined
        setTimeout(function(){
            // Create a temporary div that will act as the holder for retrieving the direct URL for the professors RMP page
            var div = document.createElement('div');
            // Remove all (/g) script tags [and their content] within the response text --> greatly reduces the size of the responseText
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
                    resolve(specificURL);
                    //console.log(specificURL);  
                }
            }else{
                // Send back an error
                reject(Error("No RMP link found"));
            }
        }, 500);
    });

    return promise;
}

/**
 * Attaches a link (URL) to the given element
 * @param {object} element 
 * @param {string} rmpLink 
 * @param {string} roughText 
 */
function modifyElement(element, rmpLink, roughText){
    // Create and modify a temporary a-tag element that will replace the current roughText with a linked-text
    var aTag = document.createElement('a');
    aTag.setAttribute('href', rmpLink);
    // Adding in target="_blank" makes the link open in a new tab
    aTag.setAttribute('target', "_blank");
    aTag.style.fontWeight = 'bold';
    aTag.style.color = '#0829a0';
    aTag.innerText = roughText;

    element.textContent = "";
    element.appendChild(aTag);

}
