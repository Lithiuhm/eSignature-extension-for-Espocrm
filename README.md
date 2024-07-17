# eSignature-extension-for-Espocrm
## Electronic signature for espocrm, tested on espocrm latest versions 8.0 -> Actual (8.3.5)

Module to allow the use of an electronic signature canvas as a field and to generate full page documents that incorporate the electronic signature and can be printed using the browser's PDF engine

Steps to create the electronic signature (eSignature) depending on the entity you want:

# HOW TO INSTALL 

### 1. Click on code and Download ZIP

![download zip](images/16.png?raw=true)

### 2. now unzip the downloaded file

![unzip](images/18.png?raw=true)

### 3. Delete images folder

![delete images folder](images/19.png?raw=true)

### 4. Now select all files and zip it again

![zip it](images/20.png?raw=true)

### 5. put a name

![put a name](images/21.png?raw=true)

### 6. Finally upload de extension and install

![put a name](images/21.png?raw=true)

# HOW TO USE

### 1. Create a new entity or edit one that you already have created, do it through the Administration panel. (I will use Ticket)

![open administrator](images/1.png?raw=true)
![open entity manager](images/2.png?raw=true)
![open your entity](images/3.png?raw=true)

### 2. Now go to fields and create a new esignature field, and named it as you want

![open fields](images/4.png?raw=true)
![create new field](images/5.png?raw=true)
![select esignature field](images/6.png?raw=true)
![put name and label](images/7.png?raw=true)

### 3. Now we have to go to the layout section and add the signature field to the design we want and put the field

![open layout](images/8.png?raw=true)
![select the layout](images/9.png?raw=true)

### 4. Now we open a ticket that we have created and we will see that we can sign, when we save the signature the date and time of the signature will appear

![select esignature field](images/10.png?raw=true)

And that is all

# print to PDF

### 1. We create a PDF template

![put name and label](images/11.png?raw=true)

### 2.  We write the name, we select the entity case (ticket) and we select the name of the esignature field and for the signature to be seen we must use a pdf helper that I have created and is used as it appears in the photo

#### ```<img src="{{img_data ESIGNATUREGFILEDNAME}}">``` 

![put name and label](images/12.png?raw=true)

### And to get the date and time use 

#### ```<img src="{{sign_date ESIGNATUREGFILEDNAME}}">``` 

![put name and label](images/15.png?raw=true)
![put name and label](images/17.png?raw=true)

### 3. We reload the page and then we go to the ticket that we have and we give the three points and we print

![put name and label](images/13.png?raw=true)
![put name and label](images/14.png?raw=true)

And that is all

## Authors

- [@lithiuhm](https://github.com/Lithiuhm)
- [@telecastg](https://github.com/telecastg)
- @Anthony Andriano

#### references

- [Original extension for espocrm OLD VERSIONS](https://github.com/EspoCRM-Custom-Modules/eSignature-for-Documents/tree/master)
