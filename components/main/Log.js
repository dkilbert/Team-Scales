import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import fire from "../fire";
import { Text, View, Button, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../assets/colors/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAppleAlt,
  faBacon,
  faBurger,
  faCalendarDay,
  faDrumstickBite,
  faFish,
  faHourglassHalf,
  faListCheck,
  faLocationDot,
  faStar,
  faUtensils,
  faWeightScale,
} from "@fortawesome/free-solid-svg-icons";
import uuid from "react-native-uuid";
//npm install react-native-uuid

export default function Log() {
  // Set today's date to track calories for today
  let today = new Date();
  let logDate = today.toDateString(
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
  );

  const usersDB = fire.firestore().collection("users");
  const userID = fire.auth().currentUser.uid;

  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [purpose, setPurpose] = useState("");
  const [dailyFood, setDailyFood] = useState(null);
  const [splitDailyFood, setSplitDailyFood] = useState(null);
  const [hobbies, setHobbies] = useState("");
  let totalHeight = feet * 12 + Number(inches);

  const [recommendedCalories, setRecommendedCalories] = useState("");
  const [purposeCalories, setPurposeCalories] = useState("");
  const [dailyCalories, setDailyCalories] = useState(0);
  const [startIndex, setStartIndex] = useState(5);
  const [endIndex, setEndIndex] = useState(10);

  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [userDataIsRetrieved, setUserDataIsRetrieved] = useState(false);
  let newDailyFood = undefined;

  // updateLog() - adds the new food added to firebase
  function updateLog() {
    usersDB
      .doc(userID)
      .collection("DailyFood")
      .add(newDailyFood)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Error", error.message, [{ text: "OK" }], {
          cancelable: true,
        });
      });

    setUserDataIsRetrieved(false);
  }

  // getUserInfo() - Retrieves all user info from firebase
  const getUserInfo = () => {
    usersDB
      .doc(userID)
      .get()
      .then((snapshot) => {
        setSex(snapshot.data().sex);
        setWeight(snapshot.data().weight);
        setFeet(snapshot.data().feet);
        setInches(snapshot.data().inches);
        setAge(snapshot.data().age);
        setPurpose(snapshot.data().purpose);
        setHobbies(snapshot.data().hobbies);

        calculateCalories();
      });

    // Retreieve DailyFood collection that stores the different food tracked for the current date which is stored in the logDate variable
    usersDB
      .doc(userID)
      .collection("DailyFood")
      .where("createdAt", "==", logDate)
      .get()
      .then((querySnapshot) => {
        let dailyFoodData = querySnapshot.docs.map((doc) => doc.data());
        setDailyFood(dailyFoodData);
        setSplitDailyFood(dailyFoodData.slice(0, 5));
        setUserDataIsRetrieved(true);
        // Update calories shown to user to reflect whhat is in the database
        changeDailyCalories();
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  // validateFoodInputs() - validates the food inputs that the user enters in the input boxes
  function validateFoodInputs(name, calories) {
    let errorMsg = "Invalid fields:";
    let isError = false;

    if (name == "") {
      errorMsg += "\nName";
      isError = true;
    }

    if (calories == "" || calories < 0) {
      errorMsg += "\nCalories";
      isError = true;
    }

    //If an error was detected.
    if (isError == true) {
      alert(errorMsg);
      isError = false;
    }
    // If everything is valid
    else {
      typeNewFood(name, calories);
    }
  }

  // typeNewFood() - creates a new food object with name, calories, and a timestamp as attributes to store to the database
  // in the users LoggedWeight collection
  function typeNewFood(name, calories) {
    let timestamp = logDate;

    newDailyFood = {
      id: uuid.v4(),
      name: name,
      calories: calories,
      createdAt: timestamp,
    };

    // Call updateLog to add this food entered to firebase
    updateLog();
    alert("You added: " + name + "\nCalories: " + calories);

    // Update the state of the component to clear input boxes and show latest food
    setFood("");
    setCalories("");
    changeDailyCalories();
  }

  // changeDailyCalories() - Calculate the amount of calories the user has consumed for the day
  function changeDailyCalories() {
    let currentCals = 0;

    if (dailyFood != null) {
      for (let i = 0; i < dailyFood.length; i++) {
        currentCals += parseFloat(dailyFood[i].calories);
      }
    }

    setDailyCalories(currentCals);
  }

  // Recommended calories to maintain weight
  // BMR
  // Harris-Benedict Formula
  // calculateCalories() - Calculate the users calories based on their gender, height, weight, age, and bmi
  function calculateCalories() {
    let calories = "";

    if (sex == "male") {
      calories = 66 + 6.3 * weight + Number(12.9 * totalHeight) - 6.8 * age;
      setRecommendedCalories(calories);
    } else {
      calories = 65 + 4.3 * weight + Number(4.7 * totalHeight) - 4.7 * age;
      setRecommendedCalories(calories);
    }

    calculatePurposeCalories(calories);
  }

  // continueList() - This function retrieves more items from the database to display to the user
  // const continueList = (start, end) => {
  // setSplitDailyFood(splitDailyFood.concat(dailyFood.slice(start, end)));
  //  setStartIndex(startIndex + 5);
  // setEndIndex(endIndex + 5);
  //};

  //allow only number inputs in calorie field
  const numOnly = (text) => {
    let newText = "";
    let numbers = "0123456789";

    for (var i = 0; i < text.length; i++) {
      if (numbers.indexOf(text[i]) > -1) {
        newText = newText + text[i];
      } else {
        alert("Please enter a number");
      }
    }
    setCalories(newText);
  };
  //calculates calories needed to gain or lose weight depending on user's purpose
  function calculatePurposeCalories(calories) {
    if (purpose == "donate") {
      setPurposeCalories(calories - 500);
    }
    if (purpose == "recieve") {
      setPurposeCalories(calories + 500);
    } else {
      setPurposeCalories(calories);
    }
  }

  // By default the userDataIsRetrieved useState hook is set to false
  // If it is false then getUserInfo() will be called to get userInfo
  if (userDataIsRetrieved == false) {
    getUserInfo();
  }

  return (
    <SafeAreaView style={styles.contentCenter}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.pageHeader}>
        <FontAwesomeIcon icon={faListCheck} size="20" />
        Log
      </Text>
      <View style={styles.logScreen}>
        <LinearGradient
          colors={[colors.lightBlue, colors.darkBlue]}
          style={styles.outerScreen}
        >
          <View style={{ alignItems: "center" }}>
            <View style={styles.logRow}>
              <Text style={styles.logData}>
                {" "}
                <FontAwesomeIcon icon={faCalendarDay} size="20" /> :{" "}
                {logDate.toString()}
              </Text>
            </View>

            <View style={styles.logPurpose}>
              <Text style={styles.foodName}>
                Your purpose is to {purpose} weight!{" "}
              </Text>
            </View>
            <Text style={styles.foodName}>
              {" "}
              <FontAwesomeIcon icon={faUtensils} size="20" /> Calories
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "95%",
                height: "10%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 4,
                borderBottomColor: colors.darkBlue,
                borderTopColor: colors.darkBlue,
                borderTopWidth: 4,
                padding: 15,
                marginBottom: 20,
              }}
            >
              <Text style={styles.contentCenter}>
                {" "}
                {Math.round(purposeCalories)} Cal - {Math.round(dailyCalories)}{" "}
                Cal = {Math.round(purposeCalories - dailyCalories)} Cal
                {"\n"} <FontAwesomeIcon icon={faStar} size="20" />{" "}
                <span style={{ fontWeight: "bold" }}>Goal </span>{" "}
                <FontAwesomeIcon icon={faLocationDot} size="20" />{" "}
                <span style={{ fontWeight: "bold" }}>Current </span>{" "}
                <FontAwesomeIcon icon={faHourglassHalf} size="20" />{" "}
                <span style={{ fontWeight: "bold" }}>Remaining</span>
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "95%",
                height: "10%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 4,
                borderBottomColor: colors.darkBlue,
                borderTopColor: colors.darkBlue,
                borderTopWidth: 4,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <FontAwesomeIcon icon={faDrumstickBite} size="20" />
              <TextInput
                style={styles.nameInput}
                placeholder=" Food"
                returnKeyType="done"
                value={food}
                onChangeText={(text) => setFood(text)}
                onSubmitEditing={() => {
                  setFood("");
                }}
              />
              <FontAwesomeIcon icon={faWeightScale} size="20" />
              <TextInput
                style={styles.calorieInput}
                keyboardType="numeric"
                placeholder="Calories"
                returnKeyType="done"
                onChangeText={(text) => numOnly(text)}
                value={calories}
                maxLength={6}
                onSubmitEditing={() => {
                  setCalories("");
                }}
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faBacon} size="20" />
              <Text style={styles.foodName}> Breakfast</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "50%",
                height: "10%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 4,
                borderBottomColor: colors.darkBlue,
                borderTopColor: colors.darkBlue,
                borderTopWidth: 4,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <Button
                title="Add Food"
                onPress={() => validateFoodInputs(food, calories) && startIndex}
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faBurger} size="20" />
              <Text style={styles.foodName}> Lunch</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "50%",
                height: "10%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 4,
                borderBottomColor: colors.darkBlue,
                borderTopColor: colors.darkBlue,
                borderTopWidth: 4,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <Button
                title="Add Food"
                onPress={() => validateFoodInputs(food, calories) && startIndex}
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faFish} size="20" />
              <Text style={styles.foodName}> Dinner</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "50%",
                height: "10%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 4,
                borderBottomColor: colors.darkBlue,
                borderTopColor: colors.darkBlue,
                borderTopWidth: 4,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <Button
                title="Add Food"
                onPress={() => validateFoodInputs(food, calories) && startIndex}
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faAppleAlt} size="20" />
              <Text style={styles.foodName}> Snacks</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "50%",
                height: "10%",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 4,
                borderBottomColor: colors.darkBlue,
                borderTopColor: colors.darkBlue,
                borderTopWidth: 4,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <Button
                title="Add Food"
                onPress={() => validateFoodInputs(food, calories) && startIndex}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  contentCenter: {
    height: "100%",
    alignItems: "center",
    fontFamily: "NunitoSans-Bold",
  },
  logScreen: {
    height: "100%",
    width: "100%",
    backgroundColor: colors.lightBlue,
  },
  logData: {
    fontSize: 20,
  },
  logPurpose: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    fontWeight: "bold",
    padding: 10,
  },
  logRow: {
    flexDirection: "row",
    width: "95%",
    height: "6%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: colors.darkBlue,
    borderTopColor: colors.darkBlue,
    borderTopWidth: 4,
    padding: 5,
  },
  calorieInput: {
    fontSize: 20,
    width: 100,
  },
  nameInput: {
    fontSize: 20,
    width: 200,
  },
  outerScreen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  pageHeader: {
    fontSize: 30,
    fontFamily: "NunitoSans-Bold",
    color: "#000000",
    backgroundColor: colors.lightBlue,
    width: "100%",
    textAlign: "center",
  },
  foodData: {},
  foodName: {
    fontSize: 20,
    color: "#000",
    fontFamily: "NunitoSans-Bold",
  },
  foodCalories: {
    fontSize: 20,
    color: "#000",
    fontFamily: "NunitoSans-Regular",
  },
};
