/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  TouchableHighlight,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {WEATHER_API_KEY} from '@env';
import Rive, {Fit} from 'rive-react-native';
import {Searchbar} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const STATE_MACHINE_NAME = 'State Machine 1';

const App = () => {
  const riveRef = useRef(null);
  const hoursListRef = useRef(null);

  const [citySearch, setCitySearch] = useState('');
  const [city, setCity] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [weatherData, setWeatherData] = useState();
  const [hourListYCoords, setHourListYCoords] = useState({});

  // 24 hr
  const [highlightedTime, setHighlightedTime] = useState();

  const getWeatherData = async city => {
    try {
      const data = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${
          city || 'Chicago'
        }&days=1`,
      );
      const jsonData = await data.json();
      if (!weatherData) {
        const currentlyCloudy = (jsonData.current.cloud || 0) >= 20;
        riveRef.current?.setInputState(
          STATE_MACHINE_NAME,
          'cloudy',
          currentlyCloudy,
        );

        const currentlyRaining = (jsonData.current.precip_mm || 0) >= 1;
        riveRef.current?.setInputState(
          STATE_MACHINE_NAME,
          'rainy',
          currentlyRaining,
        );
      }
      setWeatherData(jsonData);
      if (highlightedTime === undefined) {
        const localTimeHours = new Date(
          jsonData.location.localtime_epoch * 1000,
        ).getHours();
        setHighlightedTime(localTimeHours);
        riveRef.current?.setInputState(
          STATE_MACHINE_NAME,
          'time',
          localTimeHours,
        );
      }
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
        y: hourListYCoords[highlightedTime],
        animated: true,
      });
    }
  }, [hourListYCoords, highlightedTime]);

  useEffect(() => {
    if (!isLoadingData && riveRef.current) {
      riveRef.current.setInputState(STATE_MACHINE_NAME, 'isOpen', true);
    }
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

  const hourlyData = weatherData
    ? weatherData.forecast.forecastday[0].hour
    : [];

  const onHourClick = hourData => {
    const newHighlitedHour = parseInt(
      hourData.time.split(' ')[1].split(':')[0],
      10,
    );
    setHighlightedTime(newHighlitedHour);
    riveRef.current?.setInputState(
      STATE_MACHINE_NAME,
      'time',
      newHighlitedHour,
    );
    riveRef.current?.setInputState(
      STATE_MACHINE_NAME,
      'cloudy',
      hourData.cloud >= 20,
    );
    riveRef.current?.setInputState(
      STATE_MACHINE_NAME,
      'rainy',
      !!hourData.will_it_rain,
    );
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
      <Rive
        resourceName={'weather_app'}
        ref={riveRef}
        autoplay={true}
        artboardName="proto2"
        stateMachineName="State Machine 1"
        style={styles.riveStyles}
        fit={Fit.FitHeight}
      />
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
            )}°F`}
      </Text>
      <Text style={styles.hourlyViewHeader}>
        {isLoadingData ? null : 'Hourly Forecast'}
      </Text>
      <ScrollView style={styles.hourlyScrollView} ref={hoursListRef}>
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
                  [parsedHour]: layout.y,
                });
              }}>
              <View style={styles.hourContainer}>
                <Text style={styles.hourRowText}>{`${hourDisplay}`}</Text>
                <Text style={styles.hourRowText}>{`${Math.round(
                  hourData.temp_f,
                )}°F / ${Math.round(hourData.temp_c)}°C`}</Text>
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
    textShadowRadius: 5,
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
    textShadowRadius: 5,
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
