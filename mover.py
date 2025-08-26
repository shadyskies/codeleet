import os

# Extract all.csv from all folders and rename them as <foldername>.csv.
# Eg: amazon contains all.csv --> cp to data folder and rename as amazon.csv. Assume that all folders contain all.csv file

def extract_and_rename_csv(source_dir, target_dir):
    for foldername in os.listdir(source_dir):
        folder_path = os.path.join(source_dir, foldername)
        if os.path.isdir(folder_path):
            csv_file = os.path.join(folder_path, "all.csv")
            if os.path.exists(csv_file):
                new_csv_name = f"{foldername}.csv"
                new_csv_path = os.path.join(target_dir, new_csv_name)
                os.rename(csv_file, new_csv_path)
                print(f"Renamed and moved: {csv_file} to {new_csv_path}")
                # Optionally, you can remove the original all.csv file
                # os.remove(csv_file)
            else:
                print(f"File not found: {csv_file}")


extract_and_rename_csv("/home/shadyskies/Desktop/codeleet/leetcode-companywise-interview-questions", "data")