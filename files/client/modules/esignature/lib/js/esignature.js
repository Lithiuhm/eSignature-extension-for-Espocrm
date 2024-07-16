function eSignatureISODateString(d){
    function pad(n){return n<10 ? '0'+n : n;}
    return d.getFullYear()+'-'+ pad(d.getMonth()+1)+'-'+ pad(d.getDate())+' '+ pad(d.getHours())+':'+ pad(d.getMinutes())+':'+ pad(d.getSeconds());
}

function eSignaturePrintFullPageDocument(){
    window.print();
    // restore the copyrigth notice
    $("#footer").show();
}

function eSignatureCloseFullPageDocument() {
    window.history.back();
    // restore the copyrigth notice
    $("#footer").show();
}

function eSignatureCloseFullPageDocumentAtPortal() {
    location.replace(document.referrer);
    // restore the copyrigth notice
    $("#footer").show();    
}