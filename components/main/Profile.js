import React, { useState } from "react";
import fire from "../fire";
import { Text, View, Button, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../assets/colors/colors";
import profileStyles from "../../assets/styles/profileStyles";
import { ScrollView } from "react-native-gesture-handler";
import styles from "../../assets/styles/styles";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { TextField, InputAdornment} from "@material-ui/core";
import useStyles from "../../assets/styles/muiStyle";


// handleLogout() - signs the user out and navigates them back to the Register page
const handleLogout = () => {
  fire.auth().signOut();
};

function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }
  
  const rows = [
    createData("Frozen yoghurt", 150, 150 ),
    createData("Ice cream sandwich", 150, 150),
    createData("Eclair", 150, 150),
    createData("Cupcake", 150, 150),
    createData("Gingerbread", 150, 150),
  ];

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
            <Text style={profileStyles.pageHeader}>Profile</Text>
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
                {"Update Profile Picture"}{" "}
              </Text>
            </View>
          </Pressable>

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
                    )
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
              <Text style={profileStyles.profileData}>
                {"I want to " + purpose.toString() + " weight!"}{" "}
              </Text>
            </View>

            {/* <View style={profileStyles.profileRow}>
              <Text style={profileStyles.profileData}>Age</Text>
              <TextInput
                style={profileStyles.profileInput}
                placeholder={age.toString()}
                returnKeyType="done"
                onChangeText={(editedAge) => (newAge = editedAge)}
              />
            </View>

            <View style={profileStyles.profileRow}>
              <Text style={profileStyles.profileData}>Height</Text>
              <TextInput
                style={profileStyles.heightInput}
                placeholder={feet.toString()}
                returnKeyType="done"
                onChangeText={(editedFeet) => (newFeet = editedFeet)}
              />
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat-SemiBold",
                  color: "#000000",
                }}
              >
                '
              </Text>
              <TextInput
                style={profileStyles.heightInput}
                placeholder={inches.toString()}
                returnKeyType="done"
                onChangeText={(editedInches) => (newInches = editedInches)}
              />
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Montserrat-SemiBold",
                  color: "#000000",
                }}
              >
                "
              </Text>
            </View>

            <View style={profileStyles.profileRow}>
              <Text style={profileStyles.profileData}>Weight</Text>
              <TextInput
                style={profileStyles.weightInput}
                placeholder={weight.toString()}
                returnKeyType="done"
                onChangeText={(editedWeight) => (newWeight = editedWeight)}
              />
              <Text style={{ fontSize: 25, fontFamily: "NunitoSans-Regular" }}>
                {" "}
                lbs
              </Text>
            </View>

            <View style={profileStyles.profileRow}>
              <Text style={profileStyles.profileData}>
                BMI
                <span style={{ fontSize: 20, marginLeft: 10 }}>
                  {bmi.toString()}
                </span>
              </Text>
            </View>

            <View style={profileStyles.profileRow}>
              <Text style={profileStyles.profileData}>Hobbies</Text>
              <TextInput
                style={profileStyles.profileInput}
                placeholder={hobbies.toString()}
                returnKeyType="done"
                onChangeText={(editedHobbies) => (newHobbies = editedHobbies)}
              />
            </View> */}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: "5%",
              }}
            >
              <Button
                title="Update profile info"
                onPress={() => validateProfileEdits()}
                color="#0000FF"
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: "2%",
              }}
            >
              <Button onPress={handleLogout} title="Logout" color="#0000FF" />
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}
