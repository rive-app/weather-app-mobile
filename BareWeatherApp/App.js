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
// TODO: Import Rive from rive-react-native
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Searchbar} from 'react-native-paper';

const App = () => {
  // Tracks the user-provided searchbox value for the city
  const [citySearch, setCitySearch] = useState('');

  // Tracks the City to pull weather data from
  const [city, setCity] = useState('Chicago');

  // Tracks if the data is still loading or not
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Data from the Weather API
  const [weatherData, setWeatherData] = useState();

  // The time being highlighted for the weather shown as the hero text
  const [highlightedTime, setHighlightedTime] = useState(
    new Date(Date.now()).getHours(),
  );

  // UI state variable to track where each hour is positioned in the hour list
  // so we can scroll to the exact position of the hour selected
  const [hourListYCoords, setHourListYCoords] = useState({});
  const hoursListRef = useRef(null);

  const getWeatherData = async city => {
    try {
      // TODO: Call the weather API and update Rive state machine for all inputs
      // And set highlightedTime and weatherData
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

  useEffect(() => {
    if (Object.keys(hourListYCoords).length >= 24) {
      hoursListRef.current?.scrollTo({
        x: 0,
        y: hourListYCoords[highlightedTime],
        animated: true,
      });
    }
  }, [hourListYCoords, highlightedTime]);

  useEffect(() => {
    // TODO: Toggle the isOpen input on the Rive state machine
  }, [isLoadingData]);

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

  const onHourClick = hourData => {
    if (hourData) {
      // TODO: Get new highlighted hour time and set it in state
      // TODO: Set 'time', 'cloudy', and 'rainy' inputs
    }
  };

  const hourlyData = weatherData
    ? weatherData.forecast.forecastday[0].hour
    : [];

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
      {/* TODO: Add Rive component here */}
      <Text style={styles.cityTitle}>
        {isLoadingData || !weatherData
          ? 'Loading...'
          : `${weatherData.location.name}, ${weatherData.location.region}`}
      </Text>
      <Text style={styles.tempHero}>
        {isLoadingData || !weatherData
          ? null
          : `${weatherData.forecast.forecastday[0].hour[highlightedTime].temp_f}`}
      </Text>
      <Text style={styles.hourlyViewHeader}>{'Hourly Forecast'}</Text>
      <ScrollView style={styles.hourlyScrollView}>
        {hourlyData.map((hourData, idx) => {
          const parsedHour = parseInt(
            hourData.time.split(' ')[1].split(':')[0],
            10,
          );
          const hourDisplay = `${
            parsedHour % 12 === 0 ? 12 : parsedHour % 12
          } ${parsedHour >= 12 ? 'PM' : 'AM'}`;
          const isHighlighted = parsedHour === highlightedTime;
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
                {/* TODO: Add text for temp display */}
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
    top: 50,
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
