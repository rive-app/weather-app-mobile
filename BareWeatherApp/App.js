/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {WEATHER_API_KEY} from '@env';
import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Searchbar} from 'react-native-paper';

const STATE_MACHINE_NAME = 'State Machine 1';

const App = () => {
  const hoursListRef = useRef(null);

  const [citySearch, setCitySearch] = useState('');
  const [city, setCity] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [weatherData, setWeatherData] = useState();
  const [hourListYCoords, setHourListYCoords] = useState({});

  const [currentTime, setCurrentTime] = useState(
    new Date(Date.now()).getHours(),
  );
  const [highlightedTime, setHighlightedTime] = useState();

  const getWeatherData = async city => {
    try {
      console.log(WEATHER_API_KEY);
      const data = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${
          city || 'Chicago'
        }&days=1`,
      );
      const jsonData = await data.json();
      console.log(jsonData);
      if (!weatherData) {
        // TODO: Set "cloudy" and "rainy" inputs on the Rive state machine
      }
      setWeatherData(jsonData);
      const localTimeHours = new Date(
        jsonData.location.localtime_epoch * 1000,
      ).getHours();
      setCurrentTime(localTimeHours);
      setHighlightedTime(localTimeHours);
      // TODO: Set the "time" input on the state machine
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data in once
  useEffect(() => {
    getWeatherData(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // Scroll to hour in hourly forecast list
  useEffect(() => {
    if (Object.keys(hourListYCoords).length >= 24) {
      hoursListRef.current?.scrollTo({
        x: 0,
        y: hourListYCoords[currentTime],
        animated: true,
      });
    }
  }, [hourListYCoords, currentTime]);

  useEffect(() => {
    // TODO: Toggle the isOpen input on the Rive state machine
  }, [isLoadingData]);

  // TODO: Set new current time every minute

  const getCityData = async city => {
    try {
      const data = await fetch(
        `http://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${city}`,
      );
      const jsonData = await data.json();
      if (jsonData.length) {
        setCity(jsonData[0].name);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSearchSubmit = () => {
    getCityData(citySearch);
  };

  console.log(weatherData?.forecast);

  const hoursLeftData = weatherData
    ? weatherData.forecast.forecastday[0].hour
    : [];

  const onHourClick = hourData => {
    setHighlightedTime(new Date(hourData.time_epoch * 1000).getHours());
    // TODO: Set all the inputs of the state machine for the new hour forecast data
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search for a city"
          onChangeText={setCitySearch}
          onSubmitEditing={onSearchSubmit}
          value={citySearch}
        />
      </View>
      <Text style={styles.cityTitle}>
        {isLoadingData
          ? 'Loading...'
          : `${weatherData.location.name}, ${weatherData.location.region}`}
      </Text>
      <Text style={styles.tempHero}>
        {isLoadingData
          ? null
          : `${Math.round(
              weatherData.forecast.forecastday[0].hour[highlightedTime].temp_f,
            )}°`}
      </Text>
      <Text style={styles.hourlyViewHeader}>{'Hourly Forecast'}</Text>
      <ScrollView style={styles.hourlyScrollView} ref={hoursListRef}>
        {hoursLeftData.map((hourData, idx) => {
          const hourInt = new Date(hourData.time_epoch * 1000).getHours();
          const hourDisplay = `${hourInt % 12 === 0 ? 12 : hourInt % 12} ${
            hourInt >= 12 ? 'PM' : 'AM'
          }`;
          const isHighlighted = hourInt === highlightedTime;
          return (
            <TouchableHighlight
              key={hourData.time_epoch}
              onPress={() => onHourClick(hourData)}
              style={[
                styles.touchableHourContainer,
                isHighlighted ? styles.isHighlightedTime : {},
              ]}
              underlayColor="#DDDDDD"
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                setHourListYCoords({
                  ...hourListYCoords,
                  [new Date(hourData.time_epoch * 1000).getHours()]: layout.y,
                });
              }}>
              <View style={styles.hourContainer}>
                <Text style={styles.hourRowText}>{`${hourDisplay}`}</Text>
                <Text style={styles.hourRowText}>{`${Math.round(
                  hourData.temp_f,
                )}°F / ${Math.round(hourData.temp_c)}°C`}</Text>
                <Text style={styles.hourRowText}>{'>'}</Text>
              </View>
            </TouchableHighlight>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: Colors.lighter,
    flex: 1,
    position: 'relative',
  },
  searchSection: {
    position: 'absolute',
    top: 42,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  citySearchInput: {
    width: '100%',
    borderWidth: 1,
    padding: 10,
  },
  riveStyles: {
    flexGrow: 1,
  },
  cityTitle: {
    position: 'absolute',
    top: '15%',
    left: '0%',
    right: '0%',
    width: '100%',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '600',
    padding: '0 5%',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowRadius: 3,
  },
  tempHero: {
    position: 'absolute',
    top: '30%',
    left: '0%',
    right: '0%',
    width: '100%',
    textAlign: 'center',
    fontSize: 60,
    fontWeight: '700',
    padding: '0 5%',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowRadius: 3,
  },
  hourlyViewHeader: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    marginTop: 60,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  hourlyScrollView: {
    position: 'absolute',
    top: '50%',
    bottom: '5%',
    marginLeft: '13%',
    marginRight: '13%',
    width: '73%',
    marginTop: 100,
    marginBottom: 40,
    flex: 1,
  },
  isHighlightedTime: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  touchableHourContainer: {
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  hourContainer: {
    position: 'relative',
    width: '100%',
    padding: 10,
    flexGrow: 1,
    flexBasis: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
