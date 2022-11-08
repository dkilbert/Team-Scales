import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Image,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../assets/colors/colors";
import fire from "../fire";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LineChart from "./LineChart";
import { ScrollView } from "react-native-gesture-handler";
import {
  faCheck,
  faDollarSign,
  faHandHoldingDollar,
  faScaleBalanced,
  faUser,
  faUsers,
  faWeightScale,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Progress() {
  const usersDB = fire.firestore().collection("users");
  const userID = fire.auth().currentUser.uid;
  const [modalVisibleWeight, setModalVisibleWeight] = useState(false);
  const [modalVisibleDonate, setModalVisibleDonate] = useState(false);
  const [weight, setWeight] = useState("");
  const [userList, setUserList] = useState(null);
  const [splitUserList, setSplitUserList] = useState(null);
  const [userDataIsRetrieved, setUserDataIsRetrieved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  let today = new Date();
  const [amountDonated, setAmountDonated] = useState("");
  let logDate = today.toLocaleString("en-US");

  // logWeight() - Takes the weight inputted by the user and writes it to the database
  function logWeight() {
    const loggedWeight = {
      weight: weight,
      date: logDate,
    };

    usersDB
      .doc(userID)
      .collection("LoggedWeight")
      .add(loggedWeight)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Error", error.message, [{ text: "OK" }], {
          cancelable: true,
        });
      });

    updateWallet();
    // setModalVisible is set to false so that modal is no longer visible
    setModalVisibleWeight(!modalVisibleWeight);
    // call loadData to update graph with new weight
    loadData();
  }

  // chartData useState hook that holds the default values and options for the chart
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Weight Progress",
        data: [],
        fill: true,
        backgroundColor: "rgba(0, 224, 255, 0.5)",
        color: "rgba(0, 224, 255, 0.3)",
      },
    ],
  });

  // loadData when component loads
  useEffect(() => {
    loadData();
  }, []);

  // loadData() - Async function to retrieve data from the database to update chartData
  const loadData = async () => {
    // get data from getWeigthData which returns a sorted array of LoggedWeight by date
    let data = await getWeightData();

    // Take the weight from the data array to separate from the date
    let weight = [];
    data.forEach((element) => {
      weight.push(element.weight);
    });

    // Take the date from the data array to separate from the weight
    let date = [];
    data.forEach((element) => {
      date.push(element.date);
    });

    // setChartData to pass in the date array for the labels and weight array for the weight logged for the
    // corresponding date
    setChartData({
      labels: date,
      datasets: [
        {
          label: "Weight Progress",
          data: weight,
          fill: true,
          backgroundColor: "rgba(0, 224, 255, 0.5)",
          color: "rgba(0, 224, 255, 0.8)",
        },
      ],
    });
  };

  // getCurrentUser() - Retrieve the user using the app
  function getCurrentUser() {
    usersDB
      .where("id", "==", userID)
      .get()
      .then((querySnapshot) => {
        let userData = querySnapshot.docs.map((doc) => doc.data());
        setCurrentUser(userData[0]);
      })
      .catch((error) => console.log("Error getting current user: ", error));
  }

  // if currentUser is null, call getCurrentUser to get the current user
  if (currentUser == null) {
    getCurrentUser();
  }

  // getWeightData() - retrieves weight data from firebase and returns the data in an array that is sorted by date
  const getWeightData = async () => {
    let data = [];
    // Load data from firebase to data variable
    await usersDB
      .doc(userID)
      .collection("LoggedWeight")
      .get()
      .then((querySnapshot) => {
        data = querySnapshot.docs.map((doc) => doc.data());
      })
      .catch((error) => console.log("Error getting weight data: ", error));

    // sort data by date
    data.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    // return sorted array
    return data;
  };
  const updateWallet = async () => {
    //gets sorted weight data
    let data = await getWeightData();

    //gets weight data
    let weight = [];
    data.forEach((element) => {
      weight.push(element.weight);
    });

    let weightChange = weight[weight.length - 2] - weight[weight.length - 1];
    console.log(weightChange);

    const getWallet = async () => {
      usersDB
        .doc(userID)
        .get()
        .then((snapshot) => {
          let currentWallet = snapshot.data().wallet;
          console.log(currentWallet);
          if (weightChange > 0) {
            usersDB
              .doc(userID)
              .update({ wallet: weightChange + parseFloat(currentWallet) });
          }
        });
    };
    getWallet();
  };
  //where('purpose', '==', "receive")
  const getUsers = () => {
    usersDB
      .where("purpose", "==", "receive")
      .get()
      .then(function (querySnapshot) {
        let userData = querySnapshot.docs.map((doc) => doc.data());
        setUserList(userData);
        setSplitUserList(userData.slice(0, 4));
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });
    setUserDataIsRetrieved(true);
  };

  if (userDataIsRetrieved == false) {
    getUsers();
  }

  function weightExchange(receiver, amountDonated) {
    const getDonatorWallet = async () => {
      usersDB
        .doc(userID)
        .get()
        .then((querySnapshot) => {
          let donatorWallet = querySnapshot.data().wallet;
          //if (donatorWallet > 0) {
            usersDB
              .doc(userID)
              .update({
                wallet: parseFloat(donatorWallet) - parseFloat(amountDonated),
              });
            console.log(donatorWallet);
          }
        );
    };
    getDonatorWallet();

    const getReceiverWallet = async () => {
      usersDB
        .doc(receiver.id)
        .get()
        .then((querySnapshot) => {
          let receiverWallet = querySnapshot.data().wallet;
          usersDB
            .doc(receiver.id)
            .update({
              wallet: parseFloat(amountDonated) + parseFloat(receiverWallet),
            });
          console.log(receiverWallet);
          alert("success!");
        });
    };
    getReceiverWallet();
  }

  return (
    <LinearGradient
      colors={[colors.lightBlue, colors.darkBlue]}
      style={styles.outerScreen}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.contentCenter}>
          <StatusBar barStyle="light-content" />
          <View style={styles.header}>
            <Text style={styles.blank}>blank</Text>
            <Text style={styles.pageHeader}>Progress</Text>
            <Pressable
              style={styles.addButton}
              title="Log Weight"
              onPress={() =>
                setModalVisibleWeight(
                  (modalVisibleWeight) => !modalVisibleWeight
                )
              }
            >
              <MaterialCommunityIcons name="plus" color={"#fff"} size={26} />
            </Pressable>
          </View>
          <View style={styles.innerScreen}>
            <LineChart chartData={chartData} />
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisibleWeight}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>
                    Log Weight{" "}
                    <FontAwesomeIcon icon={faScaleBalanced} size="20" />
                  </Text>
                  <View style={styles.bar}></View>
                  <Text style={styles.inputHeader}>
                    Enter Weight{" "}
                    <FontAwesomeIcon icon={faWeightScale} size="20" />
                  </Text>
                  <TextInput
                    style={styles.weightInput}
                    keyboardType="numeric"
                    placeholder="Weight"
                    returnKeyType="done"
                    onChangeText={(editedWeight) => setWeight(editedWeight)}
                  />
                  <View style={styles.buttons}>
                    <Pressable
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setModalVisibleWeight(false)}
                    >
                      <Text style={[styles.textStyle, styles.red]}>
                        Cancel <FontAwesomeIcon icon={faXmark} size="20" />
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button, styles.logButton]}
                      onPress={logWeight}
                    >
                      <Text style={[styles.textStyle, styles.green]}>
                        Submit <FontAwesomeIcon icon={faCheck} size="20" />
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
            <View style={styles.logWeightSection}></View>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <FontAwesomeIcon icon={faUsers} size="20" />
                <Text style={styles.userName}>
                  {" "}
                  User's Available to Donate to!
                </Text>
              </View>

              <React.Fragment>
                {splitUserList != null && (
                  <FlatList
                    data={splitUserList}
                    renderItem={({ item }) => (
                      <View style={styles.userData}>
                        <Image
                          source={{ uri: item.profilePicId }}
                          style={styles.profilePicture}
                        />
                        <View style={{ alignItems: "left" }}>
                          <Text style={styles.userName}>
                            {" "}
                            <FontAwesomeIcon icon={faUser} size="20" />{" "}
                            {item.first_name + " " + item.last_name}
                          </Text>
                        </View>
                        <Button
                          title="Donate!"
                          onPress={() =>
                            setModalVisibleDonate(
                              (modalVisibleDonate) => !modalVisibleDonate
                            )
                          }
                        >
                          {" "}
                        </Button>
                        <Modal
                          animationType="fade"
                          transparent={true}
                          visible={modalVisibleDonate}
                        >
                          <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                              <Text style={styles.modalText}>
                                Donate Weight!{" "}
                                <FontAwesomeIcon
                                  icon={faHandHoldingDollar}
                                  size="20"
                                />
                              </Text>
                              <View style={styles.bar}></View>
                              <Text style={styles.inputHeader}>
                                Enter Weight Amount{" "}
                                <FontAwesomeIcon
                                  icon={faWeightScale}
                                  size="20"
                                />{" "}
                              </Text>
                              <TextInput
                                style={styles.weightInput}
                                keyboardType="numeric"
                                placeholder="lbs"
                                returnKeyType="done"
                                onChangeText={(donationAmount) =>
                                  setAmountDonated(donationAmount)
                                }
                              />
                              <View style={styles.bar}></View>
                              <Text style={styles.inputHeader}>
                                Donation Amount{" "}
                                <FontAwesomeIcon
                                  icon={faDollarSign}
                                  size="20"
                                />
                              </Text>
                              <TextInput
                                style={styles.weightInput}
                                keyboardType="numeric"
                                placeholder={"$" + amountDonated}
                                returnKeyType="done"
                                editable={false}
                              />
                              <View style={styles.buttons}>
                                <Pressable
                                  style={[styles.button, styles.cancelButton]}
                                  onPress={() => setModalVisibleDonate(false)}
                                >
                                  <Text style={[styles.textStyle, styles.red]}>
                                    Cancel{" "}
                                    <FontAwesomeIcon icon={faXmark} size="20" />
                                  </Text>
                                </Pressable>
                                <Pressable
                                  style={[styles.button, styles.logButton]}
                                  onPress={() => {
                                    weightExchange(item, amountDonated);
                                    setModalVisibleDonate(false);
                                  }}
                                >
                                  <Text
                                    style={[styles.textStyle, styles.green]}
                                  >
                                    Submit{" "}
                                    <FontAwesomeIcon icon={faCheck} size="20" />
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        </Modal>
                      </View>
                    )}
                    //onEndReached = {() => continueList(startIndex, endIndex)}
                    //onEndReachedThreshold = {1}
                    //keyExtractor = {(item, index) => index.toString()}
                  />
                )}
              </React.Fragment>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = {
  contentCenter: {
    height: "100%",
    alignItems: "center",
  },
  feedScreen: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  feedData: {
    fontSize: 20,
  },
  feedRow: {
    flexDirection: "row",
  },
  calorieInput: {
    fontSize: 20,
    width: 50,
  },
  innerScreen: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  weightInput: {
    padding: 10,
    fontSize: 20,
    width: "100%",
    borderWidth: "1px",
    borderColor: "#ddd",
    borderStyle: "solid",
    borderRadius: 5,
    color: "#000",
  },
  profilePicture: {
    marginTop: 20,
    marginBottom: 10,
    width: 90,
    height: 90,
    borderRadius: 100,
  },
  userName: {
    fontSize: 20,
    color: "#000",
    fontFamily: "NunitoSans-Bold",
  },
  userData: {
    borderWidth: 0.25,
    borderColor: "#D3D3D3",
    alignItems: "center",
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
  logWeightSection: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    justifyContent: "end",
    alignItems: "center",
    padding: 10,
  },
  logWeightBtn: {
    backgroundColor: "#1255FFD9",
    padding: 10,
    borderRadius: 5,
  },
  logWeightText: {
    color: "white",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000030",
  },
  modalView: {
    width: "90%",
    display: "absolute",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  logButton: {
    backgroundColor: "#d3f4d8",
    width: "48%",
  },
  cancelButton: {
    backgroundColor: "#f9dade",
    width: "48%",
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    fontSize: "17pt",
    fontWeight: "bold",
  },
  green: {
    color: "#228220",
  },
  red: {
    color: "#dc2833",
  },
  buttons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  inputHeader: {
    fontSize: "14pt",
    marginBottom: 10,
  },
  bar: {
    width: "100%",
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 45,
  },
  header: {
    width: "100%",
    height: 42,
    paddingRight: 15,
    paddingLeft: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  blank: {
    opacity: 0,
  },
};

export default Progress;
