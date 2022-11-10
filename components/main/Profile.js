import React, { useState } from "react";
import fire from "../fire";
import { Text, View, Image, Pressable } from "react-native";
import { Button as MyButton } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../assets/colors/colors";
import profileStyles from "../../assets/styles/profileStyles";
import { ScrollView } from "react-native-gesture-handler";
import styles from "../../assets/styles/styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  TextField,
  InputAdornment,
  Link,
  Typography,
  Button,
} from "@material-ui/core";
import useStyles from "../../assets/styles/muiStyle";
import { CurrentRenderContext } from "@react-navigation/native";

// handleLogout() - signs the user out and navigates them back to the Register page
const handleLogout = () => {
  fire.auth().signOut();
};

//classes to use mui styling
//const classes = useStyles();

export default function Profile({ navigation }) {
  const usersDB = fire.firestore().collection("users");
  const userID = fire.auth().currentUser.uid;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [bmi, setBmi] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [profilePic, setProfilePic] = useState(undefined);
  const [userDataIsRetrieved, setUserDataIsRetrieved] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [wallet, setWallet] = useState("");

  //for profile editing. hooks update too slowly.
  let newFirstName = firstName;
  let newLastName = lastName;
  let newAge = age;
  let newWeight = weight;
  let newFeet = feet;
  let newInches = inches;
  let newHobbies = hobbies;

  // validateProfileEdits() - validates that the new values are valid that the user wants to udpate
  function validateProfileEdits() {
    if (userDataIsRetrieved) {
      let errorMsg = "Invalid fields:";
      let isError = false;

      //Check if name is empty
      if (newFirstName == "" || newLastName == "") {
        errorMsg += "\nName";
        isError = true;
      }
      //Check if age is valid
      if (newAge == "" || isNaN(newAge) || newAge < 1 || newAge > 120) {
        errorMsg += "\nAge";
        isError = true;
      }
      //Check if height is valid
      if (
        newInches == "" ||
        isNaN(newInches) ||
        newInches < 0 ||
        newInches > 11 ||
        newFeet == "" ||
        isNaN(newFeet) ||
        newFeet < 0 ||
        newFeet > 10
      ) {
        errorMsg += "\nHeight";
        isError = true;
      }
      //Check if weight is valid
      if (
        newWeight == "" ||
        isNaN(newWeight) ||
        newWeight < 0 ||
        newWeight > 1500
      ) {
        errorMsg += "\nWeight";
        isError = true;
      }

      //Check if weight is valid
      if (
        newWeight == "" ||
        isNaN(newWeight) ||
        newWeight < 0 ||
        newWeight > 1500
      ) {
        errorMsg += "\nWeight";
        isError = true;
      }

      //Check if hobbies section is empty
      if (newHobbies == "") {
        errorMsg += "\nHobbies";
        isError = true;
      }

      //If an error was detected.
      if (isError == true) {
        alert(errorMsg);
        isError = false;
      }
      //If everything is valid
      else {
        updateProfile();
      }
    }
  }

  // updateProfile() - Takes the new values the user entered and updates those values in the database
  const updateProfile = () => {
    usersDB.doc(userID).update({
      first_name: newFirstName,
      last_name: newLastName,
      age: newAge,
      feet: newFeet,
      inches: newInches,
      weight: newWeight,
      hobbies: newHobbies,
      bmi: calcBMI(),
    });

    setUserDataIsRetrieved(false);
  };

  // calcBMI() - Calculate the BMI for the user after making changes to their age, height, or weight
  const calcBMI = () => {
    let totalHeight = feet * 12 + parseFloat(inches);
    return ((weight * 703) / (totalHeight * totalHeight)).toFixed(2);
  };

  //Get user information from firestore
  const getUserInfo = () => {
    usersDB
      .doc(userID)
      .get()
      .then((snapshot) => {
        setFirstName(snapshot.data().first_name);
        setLastName(snapshot.data().last_name);
        setSex(snapshot.data().sex);
        setAge(snapshot.data().age);
        setWeight(snapshot.data().weight);
        setFeet(snapshot.data().feet);
        setInches(snapshot.data().inches);
        setBmi(snapshot.data().bmi);
        setHobbies(snapshot.data().hobbies);
        setProfilePic(snapshot.data().profilePicId);
        setPurpose(snapshot.data().purpose);
        setWallet(snapshot.data().wallet);
      });

    setUserDataIsRetrieved(true);
  };

  // Uses the useState hook and is false by default when initiated.
  // If userDataIsRetrieved is false then call getUserInfo()
  if (userDataIsRetrieved == false) {
    getUserInfo();
  }

  return (
    <LinearGradient
      colors={[colors.lightBlue, colors.darkBlue]}
      style={profileStyles.outerScreen}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView style={profileStyles.contentCenter}>
          <View style={{ alignItems: "center" }}>
            {/* <Text style={profileStyles.pageHeader}>Profile</Text> */}
            <Image
              source={{ uri: profilePic }}
              style={profileStyles.profilePicture}
            />
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate("AddContainer");
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={profileStyles.profilePicAdd}>
                <Link href="#" underline="always">
                  {"Update Profile Picture"}
                </Link>
              </Text>
            </View>
          </Pressable>

          <View style={styles.wContainer}>
            <View>
              <Typography variant="h4" align="center" flex="1">
                Available balance
              </Typography>{" "}
            </View>
            <View>
              <Typography variant="h3" align="center">
                ${wallet.toString() + ".00"}
              </Typography>
            </View>
          </View>

          <View style={styles.container}>
            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                placeholder={firstName.toString()}
                label="First Name"
                returnKeyType="done"
                variant="standard"
                fullWidth
                color="primary"
                onChange={(editedFirstName) =>
                  (newFirstName = editedFirstName.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="user" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                placeholder={lastName.toString()}
                label="Last Name"
                //returnKeyType="done"
                variant="standard"
                fullWidth
                color="primary"
                onChange={(editedLastName) =>
                  (newLastName = editedLastName.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="user" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                placeholder={age.toString()}
                label="Age"
                returnKeyType="done"
                variant="standard"
                fullWidth
                color="primary"
                onChange={(editedAge) => (newAge = editedAge.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="birthday-cake" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                placeholder={feet.toString()}
                label="Height"
                returnKeyType="done"
                variant="standard"
                fullWidth
                color="primary"
                onChange={(editedFeet) => (newFeet = editedFeet.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="id-card" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                placeholder={inches.toString()}
                label="Inches"
                returnKeyType="done"
                variant="standard"
                fullWidth
                color="primary"
                onChange={(editedInches) =>
                  (newInches = editedInches.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="id-card" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                placeholder={weight.toString() + "lbs"}
                label="Weight"
                returnKeyType="done"
                variant="standard"
                fullWidth
                color="primary"
                onChange={(editedWeight) =>
                  (newWeight = editedWeight.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="balance-scale" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                value={bmi.toString()}
                label="BMI"
                returnKeyType="done"
                variant="standard"
                fullWidth
                disabled
                color="primary"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="id-card" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <TextField
                className={useStyles().field}
                value={purpose.toString()}
                label="Purpose"
                returnKeyType="done"
                variant="standard"
                fullWidth
                disabled
                color="primary"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesome name="id-card" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <Button
                variant="outlined"
                startIcon={
                  <FontAwesomeIcon icon={faHandHoldingDollar} size="24" />
                }
                onClick={() => {
                  navigation.navigate("Progress");
                }}
                color="inherit"
              >
                Donate
              </Button>
            </View>

            <View style={profileStyles.profileRow}>
              <Text style={profileStyles.profileData}>
                {"I want to " + purpose.toString() + " weight!"}{" "}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <MyButton
                title="Update profile"
                onPress={() => validateProfileEdits()}
                color="#0000FF"
              />
              <MyButton onPress={handleLogout} title="Logout" color="#0000FF" />
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}
