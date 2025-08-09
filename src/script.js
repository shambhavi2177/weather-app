const cityName= document.getElementById('city-name')
const date=document.getElementById('date')
const cityTemperature=document.getElementById('temp')
const cityHumidity= document.getElementById('humidity')
const cityWindSpeed=document.getElementById('wind')
const form = document.querySelector('form')
const errorMsg= document.getElementById('error-container')
const loader=document.getElementById('loader')
const historyContainerE1= document.getElementById('history-container')
const searchFormE1= document.getElementById('search-form')
const searchInputE1= document.getElementById('search-input')




function renderHistory()
{
    const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');

    historyContainerE1.innerHTML=''
    for(const city of history)
    {
        const historyBtn= document.createElement('button')
        historyBtn.textContent=city
        historyBtn.classList.add('history-btn','bg-purple-300','text-black','font-semibold','px-4', 'py-2', 'rounded-md','hover:cursor-pointer')


        historyBtn.setAttribute('data-city',city)

        historyContainerE1.append(historyBtn)
    }
}

function displayCurrentWeather(data)
{
    errorMsg.classList.add('hidden')    
    date.textContent= new Date().toLocaleDateString();
    cityName.textContent=data.name
    cityTemperature.textContent=`${Math.round(data.main.temp)}`
    cityHumidity.textContent=`${data.main.humidity}`
    cityWindSpeed.textContent=`${data.wind.speed}`

}

function displayForecast(forecastList)
{
    let day=1
    for(let i = 0;i<forecastList.length;i+=8)
    {

        const dailyForecast=forecastList[i];

        const dayName=document.getElementById(`day-${day}-name`)
        const dayTemp=document.getElementById(`day-${day}-temp`)
        const dayHumidity=document.getElementById(`day-${day}-humidity`)
        const dayIcon=document.getElementById(`day-${day}-icon`)

        const dateStr = dailyForecast.dt_txt
        
        const date = new Date(dateStr.replace(' ', 'T') + 'Z'); // Treat as UTC

        const options = {
            weekday: 'long',
            timeZone: 'Asia/Kolkata' // Convert to IST
        };
        const dayOfWeek = date.toLocaleDateString('en-US', options);

        const iconCode = dailyForecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        dayIcon.setAttribute("src",iconUrl)

        dayName.textContent=dayOfWeek
        dayTemp.textContent=dailyForecast.main.temp
        dayHumidity.textContent=dailyForecast.main.humidity
        day+=1        
    }

}
async function fetchWeather(city)
{
    try{
        
        loader.classList.remove('hidden')
       
        const response = await fetch(`/api/weather/${city}`)

            if(!response.ok)
            {
                const errorData=await response.json();
                throw new Error(errorData.error || 'An unknown error has occured')

            }
        const {dailyWeather,forecast} = await response.json()
        console.log("WHAT FETCH GOT-> WEATHER DATA:" ,dailyWeather)
        displayCurrentWeather(dailyWeather)
        displayForecast(forecast.list)
        saveCityToHistory(city)
    }

    catch(error)
    {
        console.log('Frontend Fetch Error:',)
        errorMsg.classList.remove('hidden')
        errorMsg.textContent= error.message
    }

    finally 
    {
        loader.classList.add('hidden')
        
    }
}

function saveCityToHistory(city)
{
    const historyString=localStorage.getItem('weatherHistory')|| '[]'
    let history=JSON.parse(historyString);//converts JSON string to javascript array 

    history=history.filter(existingCity=>existingCity.toLowerCase() !==city.toLowerCase());

    //add at the beginning
    history.unshift(city);

    if(history.length>10)
    {
        history=history.slice(0,10)
    }

    localStorage.setItem('weatherHistory',JSON.stringify(history))
    renderHistory();

}

form.addEventListener('submit',(event)=>
{
     event.preventDefault();
    const cityInput=document.getElementById('city-input').value.trim();
    if(cityInput)
    {
        fetchWeather(cityInput);
        document.getElementById('city-input').value=""

    }
    
    
})

searchFormE1.addEventListener('submit',(event)=>
{
    event.preventDefault()
    const city=searchInputE1.value.trim()
    if(city)
    {
        fetchWeather(city)
        searchInputE1.value=''
    }
})

historyContainerE1.addEventListener('click',(event)=>
{
    if(event.target.matches('.history-btn'))
    {
        // The `dataset` property provides easy access to all `data-*` attributes.
        //`event.target.dataset.city` corresponds to `data-city="..."`.

        const city = event.target.dataset.city
        fetchWeather(city)
    }
})
renderHistory()






