class Helper{
    
    parseRecipes(data){
        const countryNames = {};
    
        //iterate over the attendees
        for (const partner of data){
    
            //basically somewhat made a hashmap
            //store country if not seen before, otherwise store attendee
            if (!Object.hasOwnProperty.call(countryNames, partner.country)){
                const p = [];
                p.push(partner);
                countryNames[partner.country] = p;
            }
            else{
                countryNames[partner.country].push(partner);
            }
        }
        return countryNames;
    }
}

module.exports ={
    Helper,
}