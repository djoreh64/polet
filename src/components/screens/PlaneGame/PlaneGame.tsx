import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { MainScene } from "./game/scenes/MainScene";
import { CONSTANTS } from "./game/constants";
import styles from "./PlaneGame.module.scss";
import type { GameParams } from "./game/RouteTypes";
import { usePlayAviaMastersMutation } from "@/store/api/game.api";
import { useGetAccountQuery, useGetInfoQuery, profileApi } from "@/store/api/profile.api";
import { useDispatch } from "react-redux";
import { setGameBalanceOverride } from "@/store/ui/uiSlice";

interface PlaneGameProps {
	gameParams?: GameParams;
}

const PlaneGame = ({ gameParams }: PlaneGameProps) => {
	const gameRef = useRef<Phaser.Game | null>(null);
	const initialBet = gameParams?.betAmount ?? 1;
	const [bet, setBet] = useState(initialBet);
	const [betInput, setBetInput] = useState(`${initialBet}`);
	const [isBetEditing, setIsBetEditing] = useState(false);
	const [autoOpen, setAutoOpen] = useState(false);
	const [selectedMode, setSelectedMode] = useState(
		gameParams?.speedMode === "FAST" ? "fast" : "normal"
	);
	const [autoLeft, setAutoLeft] = useState<number | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [showBigWinModal, setShowBigWinModal] = useState(false);

	const [uiState, setUiState] = useState({
		distance: 0,
		multiplier: 1,
		isGameOver: false,
		isWin: false,
		gameBet: gameParams?.betAmount ?? 1,
	});

	const { data: infoData } = useGetInfoQuery();
	const { data: accountData } = useGetAccountQuery();
	const dispatch = useDispatch();

	const isDemo = infoData?.is_demo ?? true;

	const [localBalance, setLocalBalance] = useState<number | null>(null);

	const gameInProgressRef = useRef(false);

	const prevIsDemoRef = useRef(isDemo);
	useEffect(() => {
		if (gameInProgressRef.current) return;

		if (accountData) {
			if (localBalance === null || prevIsDemoRef.current !== isDemo) {
				const apiBalance = isDemo ? accountData.demo_balance : accountData.safe_balance;
				setLocalBalance(apiBalance);
				prevIsDemoRef.current = isDemo;
			}
		}
	}, [accountData, isDemo, localBalance]);

	const displayBalance = localBalance ?? 0;

	useEffect(() => {
		if (localBalance !== null) {
			dispatch(setGameBalanceOverride(localBalance));
		}
	}, [localBalance, dispatch]);

	useEffect(() => {
		return () => {
			dispatch(setGameBalanceOverride(null));
		};
	}, [dispatch]);

	const handlersRef = useRef<{
		onUpdateHUD: (data: { distance: number; multiplier: number }) => void;
		onGameOver: (data: { isWin: boolean; multiplier: number }) => void;
	} | null>(null);

	const finalBalanceRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isBetEditing) setBetInput(`${bet}`);
	}, [bet, isBetEditing]);

	const tgPlatform = (window as any).Telegram?.WebApp?.platform as string | undefined;
	const isMobile =
		tgPlatform === "android" ||
		tgPlatform === "ios" ||
		/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

	useEffect(() => {
		const resolution = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
		const config: Phaser.Types.Core.GameConfig = {
			type: isMobile ? Phaser.CANVAS : Phaser.WEBGL,
			width: CONSTANTS.WIDTH,
			height: CONSTANTS.HEIGHT,
			parent: "phaser-container",
			pixelArt: false,
			roundPixels: false,
			render: {
				antialias: true,
				antialiasGL: true,
				mipmapFilter: "LINEAR_MIPMAP_LINEAR",
				pixelArt: false,
			},
			physics: {
				default: "arcade",
				arcade: { gravity: { x: 0, y: 0 }, debug: false },
			},
			scene: [MainScene],
			backgroundColor: "#000000",
		};
		(config.render as any).resolution = resolution;

		const game = new Phaser.Game(config);
		gameRef.current = game;
		if (config.type === Phaser.CANVAS) {
			const ctx = game.canvas.getContext("2d");
			if (ctx) {
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "high";
			}
		}

		const onUpdateHUD = (data: { distance: number; multiplier: number }) => {
			setUiState((prev) => ({
				...prev,
				distance: data.distance,
				multiplier: data.multiplier,
			}));
		};

		const onGameOver = (data: { isWin: boolean; multiplier: number }) => {
			setUiState((prev) => {
				if (prev.isGameOver) {
					return prev;
				}

				if (finalBalanceRef.current !== null) {
					setLocalBalance(finalBalanceRef.current);

					const winAmount = prev.gameBet * data.multiplier;
					if (data.isWin && winAmount >= prev.gameBet * 3) {
						setShowBigWinModal(true);
					}
				}

				gameInProgressRef.current = false;

				return {
					...prev,
					isGameOver: true,
					isWin: data.isWin,
					multiplier: data.multiplier,
				};
			});
			setIsRunning(false);

			dispatch(profileApi.util.invalidateTags(['Account']));
		};

		handlersRef.current = { onUpdateHUD, onGameOver };

		const connectSceneEvents = () => {
			const scene = game.scene.getScene("MainScene") as MainScene;
			if (!scene || !handlersRef.current) return;

			scene.events.off("updateHUD", handlersRef.current.onUpdateHUD);
			scene.events.off("gameOver", handlersRef.current.onGameOver);

			scene.events.on("updateHUD", handlersRef.current.onUpdateHUD);
			scene.events.on("gameOver", handlersRef.current.onGameOver);

			if (gameParams) {
				scene.setGameParams(gameParams);
			}
		};

		game.events.on("ready", connectSceneEvents);

		return () => {
			game.destroy(true);
		};
	}, []);

	useEffect(() => {
		if (showBigWinModal) {
			const timer = setTimeout(() => {
				setShowBigWinModal(false);
				setUiState((prev) => ({ ...prev, multiplier: 1 }));
			}, 4000);

			return () => clearTimeout(timer);
		}
	}, [showBigWinModal]);

	useEffect(() => {
		if (uiState.isGameOver && autoLeft !== null && autoLeft > 0) {
			const timer = setTimeout(() => {
				if (autoLeft > 1) {
					setAutoLeft((prev) => (prev !== null ? prev - 1 : null));
					startGame();
				} else {
					setAutoLeft(null);
				}
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [uiState.isGameOver, autoLeft]);

	const getScene = (): MainScene | null => {
		if (!gameRef.current) return null;
		return gameRef.current.scene.getScene("MainScene") as MainScene;
	};

	const applyStakeToScene = (nextBet: number) => {
		const scene = getScene();
		if (!scene) return;
		scene.setStake(nextBet);
	};

	const clampBet = (v: number) => Math.max(1, Math.min(100, v));
	const getBetFromInputOrState = () => {
		const parsed = Number.parseInt(betInput, 10);
		return Number.isFinite(parsed) ? clampBet(parsed) : bet;
	};
	const setBetAndSync = (next: number) => {
		setBet(next);
		applyStakeToScene(next);
		setBetInput(`${next}`);
	};
	const commitBetInput = (raw: string) => {
		const parsed = Number.parseInt(raw, 10);
		if (!Number.isFinite(parsed)) {
			setBetInput(`${bet}`);
			return;
		}
		setBetAndSync(clampBet(parsed));
	};
	const openMobileBetPrompt = () => {
		const current = `${getBetFromInputOrState()}`;
		const res = window.prompt("Введите сумму ставки", current);
		if (res === null) return;
		const digits = res.replace(/[^\d]/g, "");
		if (!digits) return;
		setIsBetEditing(false);
		commitBetInput(digits);
	};

	const onMinus = () => {
		setIsBetEditing(false);
		setBetAndSync(clampBet(getBetFromInputOrState() - 1));
	};

	const onPlus = () => {
		setIsBetEditing(false);
		setBetAndSync(clampBet(getBetFromInputOrState() + 1));
	};

	const generateSeed = () => {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	};

	const [playAviaMasters] = usePlayAviaMastersMutation();

	const startGame = async (autoCount?: number) => {
		const scene = getScene();
		const stake = getBetFromInputOrState();
		if (stake !== bet) setBetAndSync(stake);
		if (!scene || isRunning || displayBalance < stake) return;

		setIsRunning(true);
		gameInProgressRef.current = true;

		setLocalBalance((prev) => (prev ?? displayBalance) - stake);

		try {
			const response = await playAviaMasters({
				bet_amount: stake,
				client_seed: generateSeed(),
				is_demo: isDemo,
			}).unwrap();

			finalBalanceRef.current = isDemo ? response.demo_balance : response.safe_balance;

			const gameParams: GameParams = {
				betAmount: stake,
				targetOutcomeType: response.is_zero ? "SINK" : "WIN",
				targetModifier: response.modifier,
				speedMode: selectedMode === "fast" ? "FAST" : "NORMAL",
			};

			if (uiState.isGameOver) {
				scene.scene.restart();
				setUiState({
					distance: 0,
					multiplier: 1,
					isGameOver: false,
					isWin: false,
					gameBet: stake,
				});


				setTimeout(() => {
					const s2 = getScene();
					if (!s2) {
						console.log("[PlaneGame] Scene not ready after restart");
						setIsRunning(false);
						return;
					}

					const onUpdateHUD = (data: { distance: number; multiplier: number }) => {
						setUiState((prev) => ({
							...prev,
							distance: data.distance,
							multiplier: data.multiplier,
						}));
					};

					const onGameOver = (data: { isWin: boolean; multiplier: number }) => {
						setUiState((prev) => {
							if (prev.isGameOver) return prev;

							if (finalBalanceRef.current !== null) {
								setLocalBalance(finalBalanceRef.current);

								const winAmount = prev.gameBet * data.multiplier;
								if (data.isWin && winAmount >= prev.gameBet * 3) {
									setShowBigWinModal(true);
								}
							}

							gameInProgressRef.current = false;

							return {
								...prev,
								isGameOver: true,
								isWin: data.isWin,
								multiplier: data.multiplier,
							};
						});
						setIsRunning(false);

						dispatch(profileApi.util.invalidateTags(['Account']));
					};

					s2.events.off("updateHUD");
					s2.events.off("gameOver");
					s2.events.on("updateHUD", onUpdateHUD);
					s2.events.on("gameOver", onGameOver);

					s2.setGameParams(gameParams);
					s2.setStake(stake);
					s2.startRun(selectedMode === "fast" ? 3 : 1);
				}, 300);
			} else {
				scene.setGameParams(gameParams);
				scene.setStake(stake);
				scene.startRun(selectedMode === "fast" ? 3 : 1);
				setUiState((prev) => ({
					...prev,
					isGameOver: false,
					multiplier: 1,
					gameBet: stake,
				}));
			}

			if (typeof autoCount === "number") setAutoLeft(autoCount);
		} catch (error) {
			console.error("[PlaneGame] API Error:", error);
			setLocalBalance((prev) => (prev ?? displayBalance) + stake);
			gameInProgressRef.current = false;
			setIsRunning(false);
		}
	};

	const stopGame = () => {
		setAutoLeft(null);
	};

	return (
		<div className={styles["game-container"]}>
			<div className={styles["phaser-wrap"]} style={{ width: "100%", height: "100%" }}>
				<div id="phaser-container" style={{ width: "100%", height: "100%" }} />
				<div className={styles["ui-overlay"]}>
					<div className={styles.switches}>
						<button
							onClick={() => setSelectedMode("normal")}
							className={`${styles.switch} ${selectedMode === "normal" ? styles.active : ""}`}
						>
							Normal
						</button>
						<button
							onClick={() => setSelectedMode("fast")}
							className={`${styles.switch} ${selectedMode === "fast" ? styles.active : ""}`}
						>
							Fast
						</button>
					</div>
					<div className={styles["ui-row"]}>
						<button className={styles["ui-btn"]} onClick={onMinus} disabled={isRunning}>
							-
						</button>
						<div className={styles["ui-current"]}>
							<input
								className={styles["ui-input"]}
								value={betInput}
								type="text"
								disabled={isRunning}
								onFocus={(e) => {
									if (isMobile) {
										e.currentTarget.blur();
										return;
									}
									setIsBetEditing(true);
									requestAnimationFrame(() => e.currentTarget.select());
								}}
								onMouseDown={(e) => {
									if (!isMobile || isRunning) return;
									e.preventDefault();
									openMobileBetPrompt();
								}}
								onTouchStart={(e) => {
									if (!isMobile || isRunning) return;
									e.preventDefault();
									openMobileBetPrompt();
								}}
								readOnly={isMobile}
								onChange={(e) => {
									if (isMobile) return;
									const next = e.currentTarget.value.replace(/[^\d]/g, "");
									setBetInput(next);
								}}
								onBlur={() => {
									if (isMobile) return;
									setIsBetEditing(false);
									commitBetInput(betInput);
								}}
								onKeyDown={(e) => {
									if (isMobile) return;
									if (e.key === "Enter") {
										e.currentTarget.blur();
										return;
									}
									if (e.key === "Escape") {
										setBetInput(`${bet}`);
										e.currentTarget.blur();
									}
								}}
							/>
							<img src="/ton.svg" width={20} height={20} alt="" />
						</div>
						<button className={styles["ui-btn"]} onClick={onPlus} disabled={isRunning}>
							+
						</button>
					</div>

					<div className={styles["ui-steps"]}>
						{[5, 10, 25, 50, 100].map((v) => (
							<button
								key={v}
								className={`${styles["ui-chip"]} ${getBetFromInputOrState() === v ? styles["active"] : ""}`}
								onClick={() => {
									if (isRunning) return;
									setIsBetEditing(false);
									setBetAndSync(clampBet(v));
								}}
							>
								<span>{v}</span>
								<img src="/ton.svg" width={16} height={16} alt="" />
							</button>
						))}
					</div>

					<div className={`${styles.autoplayCard} ${autoOpen ? styles.open : ""}`}>
						<div className={styles.autoplayHeader} onClick={() => setAutoOpen(!autoOpen)}>
							<div className=""></div>
							<div className={styles.label}>
								<span>Autoplay</span>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33236 5.11306 5.86929 6.86253M3 6V9H6"
										stroke="white"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<svg
								className={styles.arrow}
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M6 9L12 15L18 9"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>

						{autoOpen && (
							<div className={styles.autoplayContent}>
								{[5, 10, 20, 50, 100].map((v) => (
									<button
										key={v}
										type="button"
										className={styles.autoplayChip}
										onClick={() => startGame(v)}
									>
										<span>{v}</span>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33236 5.11306 5.86929 6.86253M3 6V9H6"
												stroke="white"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</button>
								))}
							</div>
						)}
					</div>

					<div className={styles["ui-actions"]}>
						{autoLeft === null ? (
							<button
								className={styles["ui-play"]}
								onClick={() => startGame()}
								disabled={isRunning}
							>
								{uiState.isGameOver ? "Play again" : "Play"}
							</button>
						) : (
							<button className={`${styles["ui-play"]} ${styles["stop"]}`} onClick={stopGame}>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
									<rect x="6" y="6" width="12" height="12" rx="3" fill="black" />
								</svg>
								Stop
								<span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>({autoLeft})</span>
							</button>
						)}
					</div>
				</div>

				<div className={`${styles["big-win-modal"]} ${showBigWinModal ? styles["active"] : ""}`}>
					<div className={styles["modal-content"]}>
						<h2 className={styles["modal-headline"]}>
							<span>{(uiState.gameBet * uiState.multiplier).toFixed(0)}</span>
							<img src="/ton.svg" width={50} height={50} alt="" />
						</h2>
						<h3 className={styles["modal-desciption"]}>Вы выиграли!</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlaneGame;