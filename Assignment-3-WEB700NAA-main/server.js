/********************************************************************************
* WEB700 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Harmon Tuazon Student ID: 165229220 Date: 07-29-2025
*
* Published URL: https://assignment-3-web-700-naa.vercel.app/
*
********************************************************************************/

const LegoData = require("./modules/legoSets")
const legoData = new LegoData()
const express = require('express')
const app = express()
const path = require('path');
const HTTP_PORT = process.env.PORT || 8080;

//Middleware
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}))



//http://localhost:8080/
app.get("/", (req, res) => {
    res.render("home")

})

//http://localhost:8080/about
app.get("/about", (req, res) => {
    res.render("about")
})

//http://localhost:8080/lego/sets
app.get("/lego/sets", async (req, res) => {
    try {
        let sets;
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        } else {
            sets = await legoData.getAllSets();
        }
         res.render("sets", {sets}); // send response to client
    } catch (err) {
        res.render("404", {message: err}); 
    }
});

//http://localhost:8080/lego/sets/:set_num
app.get("/lego/sets/:set_num", async (req, res) => {
    try {
        let sets;
        if (req.params.set_num) {
            sets = await legoData.getSetByNum(req.params.set_num);
        }

         res.render("set", {set: sets}); // send response to client
    } catch (err) {
        res.render("404", {message: err}); 
    }
});

//http://localhost:8080/lego/addSet
app.get('/lego/addSet', async (req, res) => {
    try{
      themes = await legoData.getAllThemes()
      if (themes) {
         res.render("addSet", {themes: themes});
      } 
    } catch (err) {
        res.status(404).render("404", {message: err});
    }
});

//http://localhost:8080/lego/addSet
app.post('/lego/addSet', async (req, res) => {
    const setData = req.body
    try {
        newSet = await legoData.addSet(setData);
        if (newSet){
            res.redirect('/lego/sets');
        } 
    } catch (err) {
        res.status(500).render("500", {message: err});
    }
});


//http://localhost:8080/lego/deleteSet/:set_num
app.get("/lego/deleteSet/:set_num", async (req,res)=>{
       try{
          await legoData.deleteSetByNum(req.params.set_num);
          res.redirect("/lego/sets");
       }catch(err){
          res.status(500).render("500", {message: err});
       }
});




//makes an the application listen for requests
async function listenChecker() {
    try{
        await legoData.initialize();
        app.listen(HTTP_PORT, () => {
            console.log('Server started....')
        })
    } 
    
    catch(error){
    console.log(error.message)
    }
}
listenChecker()
