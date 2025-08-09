require('dotenv').config()

const express=require('express')

// save the express package in the express variable 

const app=express()//created the app object 
app.use(express.static('public'))
const PORT = process.env.PORT || 3000

app.get('/api/weather/:city',async (req,res)=>
{
    try{
        const {city}=req.params//get the city
        const {API_KEY}=process.env// get the API_KEY

        if(!API_KEY)
        {
            throw new Error('Server configuration Error: API_KEY is missing.')
        }
        var forecastWeatherURL=`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        
        var dailyWeatherURL=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`

        const [currentWeatherResponse, forecastResponse]= await Promise.all([
            fetch(dailyWeatherURL),
            fetch(forecastWeatherURL)
        ])

        if(!currentWeatherResponse.ok || !forecastResponse.ok)
        {
            throw new Error(`City not found or API error`)
        }

        const dailyWeather = await currentWeatherResponse.json()
        const forecast = await forecastResponse.json()

        console.log("Daily Weather Response:", dailyWeather);
        console.log("Forecast Response:", forecast);

        res.json({dailyWeather,forecast})
    }
    catch(error){
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data. ' + error.message });

    }
})

app.listen(PORT,()=>
{
    console.log(`Server is running on port:${PORT}`)
})