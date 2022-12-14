const mongoose = require("mongoose");
const { ethers } = require("ethers");

const UserSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      //unique: true,
    },
    currentBalance: {
      type: String,
      required: true,
      default: "0",
    },
    currentVotingPower: {
      type: String,
      required: true,
      default: "0",
    },
    currVoteMath: {
      type: Number,
      default: 0,
    },
    delegationHistory: [
      {
        timestamp: Date,
        amount: String,
      },
    ],
    balanceHistory: [
      {
        timestamp: Date,
        amount: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("user", UserSchema);

const methods = {
  queries: {
    doesUserExists: (address) => {
      return new Promise((resolve, reject) => {
        Users.findOne({ address }, (err, user) => {
          if (err) return reject(err);
          if (!user) return resolve(false);
          return resolve(true);
        });
      });
    },

    getUserByAddress: (address) => {
      return new Promise((resolve, reject) => {
        Users.findOne({ address }, (err, user) => {
          if (err) return reject(err);
          return resolve(user);
        });
      });
    },

    getUserBalanceAtLastTimeframe: (address, currentTime, timeframe) => {
      return new Promise((resolve, reject) => {
        return resolve("hello");
      });
    },
  },
  commands: {
    createUser: (address) => {
      return new Promise(async (resolve, reject) => {
        const user = await methods.queries.getUserByAddress(address);
        if (user) {
          return resolve(user);
        } else {
          const usr = new Users({ address });
          return resolve(usr.save());
        }
      });
    },
    transferUser: (address, amount, to, timestamp) => {
      //console.log("Transfer user ", address, " ", amount, " ", to);
      return new Promise((resolve, reject) => {
        methods.queries
          .getUserByAddress(address)
          .then((user) => {
            const newBalance = to
              ? ethers.BigNumber.from(user.currentBalance).add(amount)
              : ethers.BigNumber.from(user.currentBalance).sub(amount);

            return Users.updateOne(
              { address },
              {
                $set: {
                  currentBalance: String(newBalance),
                },
                $push: {
                  balanceHistory: {
                    timestamp,
                    amount: String(newBalance),
                  },
                },
              }
            );
          })
          .then((r) => {
            return resolve("done");
          })
          .catch((err) => {
            return reject(err);
          });
      });
    },

    delegateUser: (address, amount, to, timestamp) => {
      return new Promise((resolve, reject) => {
        methods.queries
          .getUserByAddress(address)
          .then((user) => {
            const newVotingPower = to
              ? ethers.BigNumber.from(user.currentVotingPower).add(amount)
              : ethers.BigNumber.from(user.currentVotingPower).sub(amount);
            Users.updateOne(
              { address },
              {
                $set: {
                  currentVotingPower: newVotingPower,
                },
                $push: {
                  delegationHistory: {
                    timestamp,
                    amount: newVotingPower,
                  },
                },
              }
            );
          })
          .then((r) => {
            return resolve("done");
          })
          .catch((err) => {
            return reject(err);
          });
      });
    },

    setDelegate: (address, amount, timestamp) => {
      return new Promise((resolve, reject) => {
        methods.queries
          .getUserByAddress(address)
          .then((user) => {
            return Users.updateOne(
              { address },
              {
                $set: {
                  currentVotingPower: String(amount),
                  currVoteMath: ethers.BigNumber.from(amount).div(10 ** 10),
                },
                $push: {
                  delegationHistory: {
                    timestamp: timestamp,
                    amount: String(amount),
                  },
                },
              }
            );
          })
          .then((r) => {
            return resolve("done");
          })
          .catch((err) => {
            return reject(err);
          });
      });
    },

    reset: async () => {
      return await Users.deleteMany({});
    },
  },
};

methods.queries
  .getUserBalanceAtLastTimeframe("qwe", "qwe", "qwe")
  .then((a) => console.log(a))
  .catch((err) => console.log(err));

module.exports = {
  Users,
  methods,
};
